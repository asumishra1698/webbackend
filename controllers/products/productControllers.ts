import Product from "../../models/products/productModel";
import { Request, Response, NextFunction } from "express";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Create Product
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

    // SKU uniqueness check
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

    // Convert price and salePrice to numbers
    const price = Number(req.body.price);
    const salePrice = req.body.salePrice
      ? Number(req.body.salePrice)
      : undefined;

    // Validation: salePrice should always be less than price
    if (salePrice !== undefined && salePrice >= price) {
      res.status(400).json({
        status: false,
        message: "Sale price must always be less than actual price.",
      });
      return;
    }

    // Generate slug from product name
    const slug = generateSlug(req.body.name);

    // Handle images and thumbnail from multer
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

// Get All Products
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

    // Soft delete filter
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

// Get Single Product
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

// Update Product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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

// Delete Product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Soft delete: set isDeleted and deletedAt
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
