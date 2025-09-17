import express from "express";
import { allAdmin } from "../../config/permission";
import { uploadCategoryImages } from "../../middlewares/uploadMiddleware";

import {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
  exportAllProductCategories,
} from "../../controllers/products/productCategoryControllers";

const router = express.Router();

router.post(
  "/",
  allAdmin,
  uploadCategoryImages.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "thumbnailImage", maxCount: 1 },
  ]),
  createProductCategory
);
router.get("/", allAdmin, getAllProductCategories);
router.get("/:id", allAdmin, getProductCategoryById);
router.put("/:id", allAdmin, updateProductCategory);
router.delete("/:id", allAdmin, deleteProductCategory);
router.get("/export/all", allAdmin, exportAllProductCategories);

export default router;
