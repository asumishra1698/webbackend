import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadProductImages } from "../../middlewares/uploadMiddleware";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  exportAllProducts,
} from "../../controllers/products/productControllers";

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createProduct
);
router.post(
  "/:id/duplicate",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  duplicateProduct
);
router.get("/", getAllProducts);
router.get("/:id", authenticate, getProductById);
router.get("/export/all", authenticate, exportAllProducts);
router.put(
  "/:id",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateProduct
);
router.delete("/:id", authenticate, deleteProduct);



export default router;