import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 🔑 Створення JWT токена
function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// 📩 POST /api/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email і пароль обов'язкові" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Користувач уже існує" });
    }

    const user = new User({ email, password, role });
    await user.save();

    const token = createToken(user);
    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error("❌ Помилка реєстрації:", err);
    res.status(500).json({ error: "Помилка на сервері" });
  }
});

// 🔐 POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Невірний email або пароль" });
    }

    const token = createToken(user);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("❌ Помилка входу:", err);
    res.status(500).json({ error: "Помилка входу" });
  }
});

export default router;
