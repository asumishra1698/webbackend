import express from "express";
import {
  createProductBrand,
  getAllProductBrands,
  getProductBrandById,
  updateProductBrand,
  deleteProductBrand,
} from "../../controllers/products/productBrandControllers";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadBrandLogoImages } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.post(
  "/",
  uploadBrandLogoImages.single("logo"), 
  createProductBrand
);
router.get("/", authenticate, getAllProductBrands);
router.get("/:id", authenticate, getProductBrandById);
router.put("/:id", authenticate, updateProductBrand);
router.delete("/:id", authenticate, deleteProductBrand);

export default router;