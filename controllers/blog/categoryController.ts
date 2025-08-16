import { Request, Response, NextFunction } from "express";
import Category from "../../models/blog/Category";
import BlogPost from "../../models/blog/BlogPost";
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
    res.setHeader("Cache-Control", "no-store");
    const { search, page = 1, limit = 10 } = req.query;
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const categories = await Category.find(query)
      .populate("parent", "name slug")
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCategories = await Category.countDocuments(query);

    res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      categories,
      totalCategories,
      page: pageNum,
      pages: Math.ceil(totalCategories / limitNum),
      limit: limitNum,
    });
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
    const categoryIdToDelete = req.params.id;
    const defaultCategory = await Category.findOne({ slug: "uncategorized" });
    if (!defaultCategory) {
      res.status(500).json({
        message:
          "Default category 'Uncategorized' not found. Please create it first.",
      });
      return;
    }
    if (categoryIdToDelete === defaultCategory.id.toString()) {
      res.status(400).json({ message: "Cannot delete the default category." });
      return;
    }

    await BlogPost.updateMany(
      { category: categoryIdToDelete },
      { $set: { category: defaultCategory.id } }
    );

    const category = await Category.findByIdAndDelete(categoryIdToDelete);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json({
      message: `Category '${category.name}' deleted successfully. Associated posts moved to 'Uncategorized'.`,
    });
  } catch (err) {
    next(err);
  }
};
