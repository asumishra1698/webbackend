import express from "express";
import multer from "multer";
import { createBroker, getAllBrokers, getBrokerById, updateBroker, deleteBroker, exportBrokersCSV } from "../../controllers/broker/brokerControllers";
import { allAdmin } from "../../config/permission";
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
    allAdmin,
    upload.fields(documentFields.map(name => ({ name, maxCount: 1 }))),
    createBroker
);
router.get("/", allAdmin, getAllBrokers);
router.get("/export/csv", allAdmin, exportBrokersCSV);
router.get("/:id", allAdmin, getBrokerById);
router.put("/:id", allAdmin, upload.fields([
    { name: "owner_photo", maxCount: 1 },
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "gst_certificate", maxCount: 1 },
    { name: "office_photo", maxCount: 1 },
    { name: "rera_certificate", maxCount: 1 },
    { name: "letter_head", maxCount: 1 },
    { name: "cancelled_cheque", maxCount: 1 },
    { name: "agent_mou", maxCount: 1 }
]), updateBroker);

router.delete("/:id", allAdmin, deleteBroker);
export default router;