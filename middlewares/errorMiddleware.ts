import { ErrorRequestHandler } from "express";
import multer from "multer";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: `Multer Error: ${err.message}` });
    return;
  }
  if (err.message && err.message.includes("Only images")) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val: any) => val.message);
    res.status(400).json({ message: "Validation Error", errors });
    return;
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({ message: `Duplicate value for field: ${field}` });
    return;
  }
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
};

export default errorHandler;