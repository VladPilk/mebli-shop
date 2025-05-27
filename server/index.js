import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js"; // ✅ ДОДАНО

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB підключено"))
  .catch(err => console.error("Помилка підключення до MongoDB:", err));

// 📦 Роутинг
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes); // ✅ ДОДАНО

// 🟢 Запуск
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер працює на порту ${PORT}`));
