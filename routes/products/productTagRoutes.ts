import express from "express";
import {
  createProductTag,
  getAllProductTags,
  getProductTagById,
  updateProductTag,
  deleteProductTag,
} from "../../controllers/products/productTagControllers";
import { allAdmin } from "../../config/permission";

const router = express.Router();

router.post("/", allAdmin, createProductTag);
router.get("/", allAdmin, getAllProductTags);
router.get("/:id", allAdmin, getProductTagById);
router.put("/:id", allAdmin, updateProductTag);
router.delete("/:id", allAdmin, deleteProductTag);

export default router;