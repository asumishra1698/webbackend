import { Request, Response, NextFunction } from "express";
import ReferenceCategory from "../../models/referenceData/referenceModal";

export const getAllReferenceCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await ReferenceCategory.find();
    const filteredCategories = categories.map((cat: any) => ({
      ...cat.toObject(),
      items: (cat.items || []).filter((item: any) => !item.is_deleted),
    }));

    res.status(200).json({
      success: true,
      message: "Reference items fetched successfully",
      data: { data: filteredCategories, totalCategories: filteredCategories.length },
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reference items",
      error: (err as any)?.message || "Unknown error",
    });
  }
};

export const createReferenceCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.body.category;
    if (!category) {
      res.status(400).json({
        success: false,
        message: "Category field is required",
      });
      return;
    }
    const cate_key = category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    let items = req.body.items;
    if (!items) {

      items = [
        {
          key: req.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          name: req.body.name,
          description: req.body.description,
          sort_order: req.body.order ? Number(req.body.order) : 1,
          is_active: req.body.is_active === "true" || req.body.is_active === true,
          is_deleted: false,
          metadata: {
            color: req.body.color || req.body["metadata[color]"] || "",
            icon: req.file ? `/uploads/reference-icons/${req.file.filename}` : "",
          },
        },
      ];
    } else if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const { cate_key: _, ...rest } = req.body;
    const existing = await ReferenceCategory.findOne({ cate_key });
    if (existing) {
      const newItems = (items || []).filter(
        (newItem: any) =>
          !existing.items.some((item: any) => item.key === newItem.key)
      );

      if (newItems.length === 0) {
        res.status(409).json({
          success: false,
          message: "An item key already exists in this category",
        });
        return;
      }

      existing.items.push(...newItems);
      existing.itemTotal = existing.items.length;
      await existing.save();
      res.status(200).json({
        success: true,
        message: "Items added to existing category",
        data: existing,
      });
      return;
    }
    const newCategory = new ReferenceCategory({
      ...rest,
      cate_key,
      items,
      itemTotal: items ? items.length : 0,
    });

    await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Reference category created successfully",
      data: newCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create or update reference category",
      error: (err as any)?.message || "Unknown error",
    });
  }
};

export const softDeleteReferenceItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { item_id } = req.params;
    const category = await ReferenceCategory.findOne({ "items._id": item_id });
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found for this item",
      });
      return;
    }

    // Find item by _id and set is_deleted = true
    const item = category.items.find((itm: any) => itm._id.toString() === item_id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found in category",
      });
      return;
    }

    if (item.is_deleted) {
      res.status(409).json({
        success: false,
        message: "Item already deleted",
      });
      return;
    }

    item.is_deleted = true;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Item soft deleted successfully",
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: (err as any)?.message || "Unknown error",
    });
  }
};