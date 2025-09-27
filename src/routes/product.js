const express = require('express');
const userAuth = require('../middleware/auth.middleware');
const Product = require('../models/product.model');
const authRouter = require('./auth');

const productRouter = express.Router();

//api for creating product (admin only)
productRouter.post('/product', userAuth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ error: "Only admin can create products" });
    }

    const { 
      name, 
      description, 
      price, 
      currency, 
      discountPrice, 
      images, 
      thumbnail, 
      attributes, 
      rating, 
      status 
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      currency,
      discountPrice,
      images,
      thumbnail,
      attributes,
      rating,
      status
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: savedProduct });

  } catch (error) {
    console.error("Error while posting product:", error.message);
    res.status(500).json({ error: "Something went wrong while creating product" });
  }
});


productRouter.get('/all/product', userAuth, async (req, res) => {
  try {
    
    const { page = 1, limit = 10, category, status, minPrice, maxPrice, search } = req.query;

   
    const query = {};

    if (category) query.category = category; 
    if (status) query.status = status;       

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }; 
    }

  
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      products,
    });

  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Something went wrong while fetching products" });
  }
});

productRouter.get("/product/:id", userAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found in our database" });
    }

    res.status(200).json({
      message: "Product found successfully",
      product
    });

  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Something went wrong while fetching the product" });
  }
});

productRouter.put("/product/:id", userAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { role } = req.user;

  
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can update products" });
    }

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in database" });
    }

   
    const data = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, data, {
      new: true,          
      runValidators: true 
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "Something went wrong while editing product" });
  }
});

productRouter.delete("/product/:id", userAuth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete products" });
    }

    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in the database" });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: `${product.name} deleted successfully` });

  } catch (error) {
    console.error("Error while deleting the product:", error.message);
    res.status(500).json({ error: "Something went wrong while deleting product" });
  }
});



module.exports = productRouter;
