import express from "express";
import {
  createProductBrand,
  getAllProductBrands,
  getProductBrandById,
  updateProductBrand,
  deleteProductBrand,
} from "../../controllers/products/productBrandControllers";
import { allAdmin } from "../../config/permission";
import { uploadBrandLogoImages } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.post(
  "/",
  uploadBrandLogoImages.single("logo"),
  createProductBrand
);
router.get("/", allAdmin, getAllProductBrands);
router.get("/:id", allAdmin, getProductBrandById);
router.put("/:id", allAdmin, updateProductBrand);
router.delete("/:id", allAdmin, deleteProductBrand);

export default router;