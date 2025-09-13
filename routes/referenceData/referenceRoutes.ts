import express from "express";
import {
  getAllReferenceCategories,
  createReferenceCategory,
  softDeleteReferenceItem,
} from "../../controllers/referenceData/referenceControllers";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadReferenceIcon } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", authenticate, getAllReferenceCategories);
router.post("/", uploadReferenceIcon.single("icon"), authenticate, createReferenceCategory);
router.delete("/item/:item_id", softDeleteReferenceItem);

export default router;