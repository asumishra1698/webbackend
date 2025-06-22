import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import errorHandler from "./middlewares/errorMiddleware";
import authRoutes from "./routes/auth/authRoutes";

dotenv.config();
connectDB();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));