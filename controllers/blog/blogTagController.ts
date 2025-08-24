import { Request, Response, NextFunction } from "express";
import BlogTag from "../../models/blog/BlogTag";
import BlogPost from "../../models/blog/BlogPost";
import slugify from "slugify";

const generateUniqueSlug = async (name: string): Promise<string> => {
  let slug = slugify(name, { lower: true, strict: true });
  let existingTag = await BlogTag.findOne({ slug });
  let counter = 1;
  while (existingTag) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
    existingTag = await BlogTag.findOne({ slug });
    counter++;
  }
  return slug;
};

export const createBlogTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Blog Tag name is required" });
      return;
    }
    const slug = await generateUniqueSlug(name);
    const blogTag = new BlogTag({ name, slug });
    await blogTag.save();
    res.status(201).json(blogTag);
  } catch (err) {
    next(err);
  }
};

export const getAllBlogTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const blogTags = await BlogTag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalTags = await BlogTag.countDocuments(query);

    res.status(200).json({
      status: true,
      message: "Blog Tags fetched successfully",
      blogTags,
      totalTags,
      page: pageNum,
      pages: Math.ceil(totalTags / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBlogTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const updateData: { name?: string; slug?: string } = {};

    if (name) {
      updateData.name = name;
      updateData.slug = await generateUniqueSlug(name);
    }

    const blogTag = await BlogTag.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!blogTag) {
      res.status(404).json({ message: "Blog Tag not found" });
      return;
    }
    res.json(blogTag);
  } catch (err) {
    next(err);
  }
};

export const deleteBlogTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tagIdToDelete = req.params.id;

    // 1. Saare posts se is tag ko remove karein
    await BlogPost.updateMany(
      { tags: tagIdToDelete },
      { $pull: { tags: tagIdToDelete } }
    );

    // 2. Ab tag ko delete karein
    const blogTag = await BlogTag.findByIdAndDelete(tagIdToDelete);
    if (!blogTag) {
      res.status(404).json({ message: "Blog Tag not found" });
      return;
    }

    res.json({
      message: `Blog Tag '${blogTag.name}' deleted successfully and removed from all posts.`,
    });
  } catch (err) {
    next(err);
  }
};
