import express from "express";
import multer from "multer";
import { createBroker, getAllBrokers } from "../../controllers/broker/brokerControllers";
import { authenticate } from "../../middlewares/authMiddleware";
const router = express.Router();
const upload = multer({ dest: "uploads/brokers/" });

const documentFields = [
    "owner_photo",
    "aadhar_card",
    "pan_card",
    "gst_certificate",
    "office_photo",
    "rera_certificate",
    "letter_head",
    "cancelled_cheque",
    "agent_mou"
];

router.post(
    "/",
    authenticate,
    upload.fields(documentFields.map(name => ({ name, maxCount: 1 }))),
    createBroker
);
router.get("/", authenticate, getAllBrokers);
export default router;