import ProductBrand from "../../models/products/productBrandModal";
import { Request, Response, NextFunction } from "express";

// Create ProductBrand
export const createProductBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.name) {
      res
        .status(400)
        .json({ status: false, message: "Brand name is required" });
      return;
    }
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Handle logo image file
    let logo = "";
    if (req.file) {
      logo = req.file.filename;
    }

    const brand = await ProductBrand.create({
      ...req.body,
      slug,
      logo,
    });
    res
      .status(201)
      .json({ status: true, message: "Product brand created", brand });
  } catch (err) {
    next(err);
  }
};

// Get All ProductBrands
export const getAllProductBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Soft delete filter
    const query: any = { isDeleted: false };

    // Search by name or slug
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const brands = await ProductBrand.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await ProductBrand.countDocuments(query);

    res.status(200).json({
      status: true,
      brands,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single ProductBrand
export const getProductBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brand = await ProductBrand.findById(req.params.id);
    if (!brand) {
      res
        .status(404)
        .json({ status: false, message: "Product brand not found" });
      return;
    }
    res.status(200).json({ status: true, brand });
  } catch (err) {
    next(err);
  }
};

// Update ProductBrand
export const updateProductBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    const brand = await ProductBrand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!brand) {
      res
        .status(404)
        .json({ status: false, message: "Product brand not found" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "Product brand updated", brand });
  } catch (err) {
    next(err);
  }
};

// Delete ProductBrand
export const deleteProductBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Soft delete: set isDeleted and deletedAt
    const brand = await ProductBrand.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!brand) {
      res
        .status(404)
        .json({ status: false, message: "Product brand not found" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "Product brand soft deleted" });
  } catch (err) {
    next(err);
  }
};
