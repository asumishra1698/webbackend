import Product from "../../models/products/productModel";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { parse } from "csv-parse";
import { Parser } from "json2csv";

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
    const {
      _id,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = originalProduct;
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

export const exportAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({})
      .populate("productcategory")
      .populate("producttags")
      .populate("brand")
      .lean();
    const fields = [
      "name",
      "slug",
      "description",
      "price",
      "salePrice",
      "productcategory",
      "brand",
      "sku",
      "barcode",
      "variants",
      "stock",
      "images",
      "thumbnail",
      "producttags",
      "weight",
      "dimensions.length",
      "dimensions.width",
      "dimensions.height",
      "isFeatured",
      "isActive",
      "rating",
      "reviews",
      "discount",
      "tax",
      "shippingClass",
      "warranty",
      "returnPolicy",
      "vendor",
      "isDeleted",
      "deletedAt",
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "createdAt",
      "updatedAt"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(products);
    res.header("Content-Type", "text/csv");
    res.attachment("products.csv");
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to export products",
      error: (err as any)?.message || "Unknown error",
    });
  }
};

export const importProductsFromCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ status: false, message: "CSV file is required" });
      return;
    }
    const products: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => {
        ["productcategory", "producttags", "reviews"].forEach((field) => {
          if (row[field] && typeof row[field] === "string") {
            row[field] = row[field].split(";").map((id: string) => id.trim());
          }
        });
        ["brand", "vendor"].forEach((field) => {
          if (row[field] && typeof row[field] === "string") {
            row[field] = row[field].trim();
          }
        });
        ["isFeatured", "isActive", "isDeleted"].forEach((field) => {
          if (row[field] && typeof row[field] === "string") {
            row[field] = row[field].toLowerCase() === "true";
          }
        });
        if (row.variants && typeof row.variants === "string") {
          try {
            row.variants = JSON.parse(row.variants);
          } catch {
            row.variants = [];
          }
        }
        if (row.images && typeof row.images === "string") {
          row.images = row.images.split(";").map((img: string) => img.trim());
        }
        if (row.dimensions && typeof row.dimensions === "string") {
          try {
            row.dimensions = JSON.parse(row.dimensions);
          } catch {
            row.dimensions = {};
          }
        }
        products.push(row);
      })
      .on("end", async () => {
        try {
          const result = await Product.insertMany(products, { ordered: false });
          res.status(201).json({
            status: true,
            message: "Products imported successfully",
            total: result.length,
            inserted: result,
          });
        } catch (err: any) {
          res.status(500).json({
            status: false,
            message: "Failed to save products",
            error: err?.message || "Unknown error",
            errors: err?.errors || err,
          });
        }
      })
      .on("error", (err) => {
        res.status(500).json({
          status: false,
          message: "Failed to import products",
          error: err.message,
        });
      });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: "Failed to import products",
      error: err?.message || "Unknown error",
    });
  }
};