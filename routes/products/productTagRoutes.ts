import express from "express";
import {
  createProductTag,
  getAllProductTags,
  getProductTagById,
  updateProductTag,
  deleteProductTag,
} from "../../controllers/products/productTagControllers";

const router = express.Router();

router.post("/", createProductTag);
router.get("/", getAllProductTags);
router.get("/:id", getProductTagById);
router.put("/:id", updateProductTag);
router.delete("/:id", deleteProductTag);

export default router;