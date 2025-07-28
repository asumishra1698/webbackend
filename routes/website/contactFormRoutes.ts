import express from "express";
import {
  submitContactForm,
  getAllContacts,
} from "../../controllers/website/contactFormControllers";
import { authenticate } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/submit", submitContactForm);
router.get("/all", authenticate, getAllContacts);

export default router;