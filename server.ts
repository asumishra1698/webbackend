import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import "./middlewares/cleanupCron";
import loggerMiddleware from "./middlewares/loggerMiddleware";
import path from "path";
import connectDB from "./config/db";
import errorHandler from "./middlewares/errorMiddleware";
import authRoutes from "./routes/auth/authRoutes";
import contactFormRoutes from "./routes/contact/contactFormRoutes";

import blogPostRoutes from "./routes/blog/blogPostRoutes";
import blogTagRoutes from "./routes/blog/blogTagRoutes";
import blogCategoryRoutes from "./routes/blog/blogCategoryRoutes";

import productRoutes from "./routes/products/productRoutes";
import productCategoryRoutes from "./routes/products/productCategoryRoutes";

import productTagRoutes from "./routes/products/productTagRoutes";
import productBrandRoutes from "./routes/products/productBrandRoutes";
import referenceRoutes from "./routes/referenceData/referenceRoutes";
import projectRoutes from "./routes/projects/projectRoutes";

dotenv.config();
connectDB();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());
app.use(loggerMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactFormRoutes);

// Blog Routes
app.use("/api/blog/categories", blogCategoryRoutes);
app.use("/api/blog/tags", blogTagRoutes);
app.use("/api/blog/posts", blogPostRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/product-tags", productTagRoutes);
app.use("/api/product-brands", productBrandRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/projects", projectRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
