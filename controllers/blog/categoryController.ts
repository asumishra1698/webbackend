import { Request, Response, NextFunction } from "express";
import Category from "../../models/blog/Category";
import slugify from "slugify";

const generateUniqueSlug = async (name: string): Promise<string> => {
  let slug = slugify(name, { lower: true, strict: true });
  let existingCategory = await Category.findOne({ slug });
  let counter = 1;
  while (existingCategory) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
    existingCategory = await Category.findOne({ slug });
    counter++;
  }
  return slug;
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, parent } = req.body;
    if (!name) {
      res.status(400).json({ message: "Category name is required" });
      return;
    }
    const slug = await generateUniqueSlug(name);
    const category = new Category({ name, slug, parent: parent || null });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find().populate("parent", "name slug");
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, parent } = req.body;
    const updateData: { name?: string; slug?: string; parent?: any } = {};

    if (name) {
      updateData.name = name;
      updateData.slug = await generateUniqueSlug(name);
    }

    if (parent !== undefined) {
      updateData.parent = parent || null;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};
