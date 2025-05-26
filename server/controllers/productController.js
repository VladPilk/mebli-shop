import Product from "../models/Product.js";

// Отримати всі товари
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Не вдалося отримати товари" });
  }
};

// Додати новий товар
export const addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: "Не вдалося додати товар" });
  }
};
