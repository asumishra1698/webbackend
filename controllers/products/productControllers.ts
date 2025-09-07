import Product from "../../models/products/productModel";
import { Request, Response, NextFunction } from "express";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body.name || !req.body.price) {
      res.status(400).json({
        status: false,
        message: "Validation Error",
        errors: ["Path `name` is required.", "Path `price` is required."],
      });
      return;
    }

    if (req.body.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        res.status(400).json({
          status: false,
          message: `Product with SKU '${req.body.sku}' already exists.`,
        });
        return;
      }
    }

    const price = Number(req.body.price);
    const salePrice = req.body.salePrice
      ? Number(req.body.salePrice)
      : undefined;
    if (salePrice !== undefined && salePrice >= price) {
      res.status(400).json({
        status: false,
        message: "Sale price must always be less than actual price.",
      });
      return;
    }

    const slug = generateSlug(req.body.name);
    const images =
      req.files && (req.files as any).images
        ? (req.files as any).images.map((file: any) => file.filename)
        : [];
    const thumbnail =
      req.files &&
        (req.files as any).thumbnail &&
        (req.files as any).thumbnail[0]
        ? (req.files as any).thumbnail[0].filename
        : "";
    if (typeof req.body.variants === "string") {
      try {
        let parsed = JSON.parse(req.body.variants);
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (!Array.isArray(parsed)) {
          throw new Error("Parsed variants is not an array");
        }
        req.body.variants = parsed;
      } catch (e) {
        res.status(400).json({
          status: false,
          message: "Invalid variants format. Must be a JSON array.",
        });
        return;
      }
    }

    const product = await Product.create({
      ...req.body,
      price,
      salePrice,
      slug,
      images,
      thumbnail,
    });

    res.status(201).json({
      status: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const duplicateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const originalProduct = await Product.findById(req.params.id).lean();
    if (!originalProduct) {
      res.status(404).json({ status: false, message: "Original product not found" });
      return;
    }

    // Handle new images/thumbnail if uploaded, else copy from original
    let images = Array.isArray(originalProduct.images)
      ? [...originalProduct.images]
      : [];
    let thumbnail = originalProduct.thumbnail || "";
    if (req.files && (req.files as any).images) {
      images = (req.files as any).images.map((file: any) => file.filename);
    }
    if (
      req.files &&
      (req.files as any).thumbnail &&
      (req.files as any).thumbnail[0]
    ) {
      thumbnail = (req.files as any).thumbnail[0].filename;
    }

    // Remove _id, createdAt, updatedAt, deletedAt
    const {
      _id,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = originalProduct;

    // Build new product data
    const newProductData = {
      ...rest,
      name: originalProduct.name + " Copy",
      slug: generateSlug(originalProduct.name + " Copy"),
      sku: originalProduct.sku ? originalProduct.sku + "-COPY" : undefined,
      images,
      thumbnail,
      variants: Array.isArray(originalProduct.variants)
        ? [...originalProduct.variants]
        : [],
      productcategory: Array.isArray(originalProduct.productcategory)
        ? [...originalProduct.productcategory]
        : [],
      producttags: Array.isArray(originalProduct.producttags)
        ? [...originalProduct.producttags]
        : [],
      brand: originalProduct.brand || undefined,
      vendor: originalProduct.vendor || undefined,
      reviews: Array.isArray(originalProduct.reviews)
        ? [...originalProduct.reviews]
        : [],
      dimensions: originalProduct.dimensions
        ? { ...originalProduct.dimensions }
        : { length: 0, width: 0, height: 0 },
      isDeleted: false,
      deletedAt: undefined,
      // All other fields are copied by spread
    };

    const duplicatedProduct = await Product.create(newProductData);

    res.status(201).json({
      status: true,
      message: "Product duplicated successfully",
      product: duplicatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      productcategory,
      producttags,
      brand,
    } = req.query;
    const query: any = { isDeleted: false };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (productcategory) {
      query.productcategory = productcategory;
    }
    if (producttags) {
      query.producttags = {
        $in: Array.isArray(producttags) ? producttags : [producttags],
      };
    }
    if (brand) {
      query.brand = brand;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate("productcategory")
      .populate("producttags")
      .populate("brand")
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();
    const total = await Product.countDocuments(query);

    res.status(200).json({
      status: true,
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ status: false, message: "Product not found" });
      return;
    }
    res.status(200).json({ status: true, product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (typeof req.body.variants === "string") {
      try {
        let parsed = JSON.parse(req.body.variants);
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (!Array.isArray(parsed)) {
          throw new Error("Parsed variants is not an array");
        }
        req.body.variants = parsed;
      } catch (e) {
        res.status(400).json({
          status: false,
          message: "Invalid variants format. Must be a JSON array.",
        });
        return;
      }
    }
    let dimensions = req.body.dimensions;
    if (typeof dimensions === "string") {
      try {
        dimensions = JSON.parse(dimensions);
      } catch (e) {
        dimensions = { length: "", width: "", height: "" };
      }
      req.body.dimensions = dimensions;
    }
    if (req.files && (req.files as any).images) {
      req.body.images = (req.files as any).images.map((file: any) => file.filename);
    }
    if (
      req.files &&
      (req.files as any).thumbnail &&
      (req.files as any).thumbnail[0]
    ) {
      req.body.thumbnail = (req.files as any).thumbnail[0].filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      res.status(404).json({ status: false, message: "Product not found" });
      return;
    }
    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!product) {
      res.status(404).json({ status: false, message: "Product not found" });
      return;
    }
    res.status(200).json({
      status: true,
      message: "Product soft deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};