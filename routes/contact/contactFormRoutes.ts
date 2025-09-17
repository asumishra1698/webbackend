import express from "express";
import {
  submitContactForm,
  getAllContacts,
} from "../../controllers/contact/contactFormControllers";
import { allAdmin } from "../../config/permission";

const router = express.Router();

router.post("/submit", submitContactForm);
router.get("/all", allAdmin, getAllContacts);

export default router;