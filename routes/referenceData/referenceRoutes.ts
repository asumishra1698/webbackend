import express from "express";
import {
  getAllReferenceCategories,
  createReferenceCategory,
  softDeleteReferenceItem,
} from "../../controllers/referenceData/referenceControllers";
import { allAdmin } from "../../config/permission";
import { uploadReferenceIcon } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", allAdmin, getAllReferenceCategories);
router.post("/", uploadReferenceIcon.single("icon"), allAdmin, createReferenceCategory);
router.delete("/item/:item_id", allAdmin, softDeleteReferenceItem);

export default router;