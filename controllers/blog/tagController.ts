import { Request, Response, NextFunction } from "express";
import Tag from "../../models/blog/Tag";
import BlogPost from "../../models/blog/BlogPost";
import slugify from "slugify";

const generateUniqueSlug = async (name: string): Promise<string> => {
  let slug = slugify(name, { lower: true, strict: true });
  let existingTag = await Tag.findOne({ slug });
  let counter = 1;
  while (existingTag) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
    existingTag = await Tag.findOne({ slug });
    counter++;
  }
  return slug;
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Tag name is required" });
      return;
    }
    const slug = await generateUniqueSlug(name);
    const tag = new Tag({ name, slug });
    await tag.save();
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
};

export const getAllTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const tags = await Tag.find(query)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalTags = await Tag.countDocuments(query);

    res.status(200).json({
      status: true,
      message: "Tags fetched successfully",
      tags,
      totalTags,
      page: pageNum,
      pages: Math.ceil(totalTags / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTag = async (
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

    const tag = await Tag.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }
    res.json(tag);
  } catch (err) {
    next(err);
  }
};



// ... baaki ka code ...

export const deleteTag = async (
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
    const tag = await Tag.findByIdAndDelete(tagIdToDelete);
    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }

    res.json({ message: `Tag '${tag.name}' deleted successfully and removed from all posts.` });
  } catch (err) {
    next(err);
  }
};