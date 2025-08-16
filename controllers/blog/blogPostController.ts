import { Request, Response, NextFunction } from "express";
import BlogPost from "../../models/blog/BlogPost";
import slugify from "slugify";

const generateUniqueSlug = async (title: string): Promise<string> => {
  let slug = slugify(title, { lower: true, strict: true });
  let existingPost = await BlogPost.findOne({ slug });
  let counter = 1;
  while (existingPost) {
    slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
    existingPost = await BlogPost.findOne({ slug });
    counter++;
  }
  return slug;
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      tags,
      metaTitle,
      metaDescription,
      canonicalUrl,
      status,
    } = req.body;
    const author = (req as any).user.id;

    // Images from multer
    const featuredImage = req.files && (req.files as any).featuredImage
      ? (req.files as any).featuredImage[0].filename
      : "";
    const galleryImages = req.files && (req.files as any).galleryImages
      ? (req.files as any).galleryImages.map((img: any) => img.filename)
      : [];

    // category ko array me convert karein
    let categoryArr = category;
    if (typeof category === "string") {
      categoryArr = [category];
    } else if (Array.isArray(category)) {
      categoryArr = category;
    } else {
      categoryArr = [];
    }

    // tags ko array me convert karein
    let tagsArr = tags;
    if (typeof tags === "string") {
      tagsArr = [tags];
    } else if (Array.isArray(tags)) {
      tagsArr = tags;
    } else {
      tagsArr = [];
    }

    if (!title || !description || !categoryArr.length || !featuredImage) {
      res.status(400).json({
        message: "Title, description, category (at least one), and featuredImage are required.",
      });
      return;
    }

    const slug = await generateUniqueSlug(title);

    const newPost = new BlogPost({
      title,
      slug,
      description,
      author,
      category: categoryArr,
      tags: tagsArr,
      featuredImage,
      galleryImages,
      metaTitle,
      metaDescription,
      canonicalUrl,
      status,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, tag, search, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Status filter (optional)
    if (status && (status === "draft" || status === "published")) {
      query.status = status;
    }
    // Agar status nahi diya toh sabhi posts laayega

    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) query.title = { $regex: search, $options: "i" };

    const posts = await BlogPost.find(query)
      .populate("author", "name email")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPostBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .populate("category", "name slug")
      .populate("tags", "name slug");

    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, ...otherFields } = req.body;
    const updateData: any = { ...otherFields };

    if (title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title);
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const updatePostStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || (status !== "draft" && status !== "published")) {
      res.status(400).json({ message: "Status must be 'draft' or 'published'" });
      return;
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("author", "name email")
      .populate("category", "name slug")
      .populate("tags", "name slug");

    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }

    res.status(200).json({
      message: "Post status updated successfully",
      post,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Blog post not found" });
      return;
    }
    res.json({ message: "Blog post deleted successfully" });
  } catch (err) {
    next(err);
  }
};