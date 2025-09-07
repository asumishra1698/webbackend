import express from "express";
import multer from "multer";
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
  importProductsFromCSV,
} from "../../controllers/products/productControllers";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Create product with images
router.post(
  "/",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createProduct
);

// Bulk import products from CSV
router.post(
  "/import/csv",
  authenticate,
  upload.single("file"),
  importProductsFromCSV
);

// Duplicate product with images
router.post(
  "/:id/duplicate",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  duplicateProduct
);

// Get all products
router.get("/", getAllProducts);

// Get product by ID
router.get("/:id", authenticate, getProductById);

// Export all products
router.get("/export/all", authenticate, exportAllProducts);

// Update product with images
router.put(
  "/:id",
  authenticate,
  uploadProductImages.fields([
    { name: "images", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateProduct
);

// Delete product
router.delete("/:id", authenticate, deleteProduct);

export default router;