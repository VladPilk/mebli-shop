import express from "express";
import Product from "../models/Product.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔐 Middleware для перевірки токена
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("⛔️ Токен відсутній");
    return res.status(401).json({ error: "Немає токена" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.log("⛔️ Невалідний токен:", err.message);
    res.status(403).json({ error: "Невалідний токен" });
  }
}

// 📦 GET: Отримати всі товари (або фільтр за категорією)
router.get("/", async (req, res) => {
  const category = req.query.category;

  try {
    const products = category
      ? await Product.find({ category })
      : await Product.find();

    res.json(products);
  } catch (err) {
    console.error("❌ Помилка отримання товарів:", err.message);
    res.status(500).json({ error: "Не вдалося отримати товари" });
  }
});

// 📦 GET: Отримати один товар за ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Товар не знайдено" });
    res.json(product);
  } catch (err) {
    console.error("❌ Помилка отримання товару:", err.message);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

// ➕ POST: Додати новий товар (🔐 з токеном)
router.post("/", verifyToken, async (req, res) => {
  console.log("📥 Дані, які надійшли:", req.body);

  try {
    const { name, price, category } = req.body;

    // 🛑 Перевірка обов’язкових полів
    if (!name || !price || !category) {
      console.log("⚠️ Обов’язкові поля відсутні");
      return res.status(400).json({
        error: "Відсутні обов'язкові поля: name, price або category"
      });
    }

    const newProduct = new Product(req.body);
    await newProduct.save();

    console.log("✅ Товар збережено:", newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Помилка додавання товару:", err.message);
    res.status(400).json({
      error: "Помилка додавання товару",
      details: err.message
    });
  }
});

// ✏️ PUT: Оновити товар за ID (🔐 з токеном)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Товар не знайдено" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Помилка оновлення товару:", err.message);
    res.status(500).json({ error: "Помилка редагування товару" });
  }
});

// ❌ DELETE: Видалити товар за ID (🔐 з токеном)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: "Товар не знайдено" });
    res.json({ message: "Товар видалено" });
  } catch (err) {
    console.error("❌ Помилка видалення товару:", err.message);
    res.status(500).json({ error: "Помилка видалення товару" });
  }
});

export default router;
