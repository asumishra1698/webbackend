import ProductTag from "../../models/products/productTagModel";
import { Request, Response, NextFunction } from "express";

// Create ProductTag
export const createProductTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.name) {
      res.status(400).json({ status: false, message: "Tag name is required" });
      return;
    }
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const tag = await ProductTag.create({
      ...req.body,
      slug,
    });
    res.status(201).json({ status: true, message: "Product tag created", tag });
  } catch (err) {
    next(err);
  }
};

// Get All ProductTags
export const getAllProductTags = async (
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

    const tags = await ProductTag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await ProductTag.countDocuments(query);

    res.status(200).json({
      status: true,
      tags,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single ProductTag
export const getProductTagById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tag = await ProductTag.findById(req.params.id);
    if (!tag) {
      res.status(404).json({ status: false, message: "Product tag not found" });
      return;
    }
    res.status(200).json({ status: true, tag });
  } catch (err) {
    next(err);
  }
};

// Update ProductTag
export const updateProductTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    const tag = await ProductTag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tag) {
      res.status(404).json({ status: false, message: "Product tag not found" });
      return;
    }
    res.status(200).json({ status: true, message: "Product tag updated", tag });
  } catch (err) {
    next(err);
  }
};

// Delete ProductTag
export const deleteProductTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Soft delete: set isDeleted and deletedAt
    const tag = await ProductTag.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!tag) {
      res.status(404).json({ status: false, message: "Product tag not found" });
      return;
    }
    res.status(200).json({ status: true, message: "Product tag soft deleted" });
  } catch (err) {
    next(err);
  }
};
