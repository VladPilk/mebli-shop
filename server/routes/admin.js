import express from "express";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({
      username: req.body.username,
      password: hashedPassword,
    });
    await admin.save();
    res.status(201).json({ message: "Адміністратор створений" });
  } catch (err) {
    console.error("Помилка реєстрації:", err); // ← лог помилки
    res.status(500).json({ error: "Помилка реєстрації", details: err.message }); // ← подробиці
  }
});

router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(400).json({ error: "Адміністратор не знайдений" });
    }

    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Невірний пароль" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET не вказаний у .env файлі");
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error("Помилка логіну:", err); // ← лог помилки
    res.status(500).json({ error: "Помилка входу", details: err.message }); // ← подробиці
  }
});

export default router;
