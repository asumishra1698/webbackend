import ProductCategory from "../../models/products/productCategoryModel";
import { Request, Response, NextFunction } from "express";

// Create ProductCategory
export const createProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.name) {
      res
        .status(400)
        .json({ status: false, message: "Category name is required" });
      return;
    }
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Handle file uploads
    let bannerImage = "";
    let thumbnailImage = "";
    if (req.files) {
      if ((req.files as any).bannerImage && (req.files as any).bannerImage[0]) {
        bannerImage = (req.files as any).bannerImage[0].filename;
      }
      if (
        (req.files as any).thumbnailImage &&
        (req.files as any).thumbnailImage[0]
      ) {
        thumbnailImage = (req.files as any).thumbnailImage[0].filename;
      }
    }

    const category = await ProductCategory.create({
      ...req.body,
      slug,
      bannerImage,
      thumbnailImage,
    });
    res
      .status(201)
      .json({ status: true, message: "Product category created", category });
  } catch (err) {
    next(err);
  }
};

// Get All ProductCategories
export const getAllProductCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query: any = { isDeleted: false };
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const categories = await ProductCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await ProductCategory.countDocuments(query);

    res.status(200).json({
      status: true,
      categories,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single ProductCategory
export const getProductCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      res
        .status(404)
        .json({ status: false, message: "Product category not found" });
      return;
    }
    res.status(200).json({ status: true, category });
  } catch (err) {
    next(err);
  }
};

// Update ProductCategory
export const updateProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) {
      res
        .status(404)
        .json({ status: false, message: "Product category not found" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "Product category updated", category });
  } catch (err) {
    next(err);
  }
};

// Delete ProductCategory
export const deleteProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Soft delete: set isDeleted and deletedAt
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!category) {
      res
        .status(404)
        .json({ status: false, message: "Product category not found" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "Product category soft deleted" });
  } catch (err) {
    next(err);
  }
};
