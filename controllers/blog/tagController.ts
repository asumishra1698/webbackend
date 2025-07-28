import { Request, Response, NextFunction } from "express";
import Tag from "../../models/blog/Tag";
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
    const tags = await Tag.find();
    res.json(tags);
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
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }
    res.json(tag);
  } catch (err) {
    next(err);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }
    res.json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
};