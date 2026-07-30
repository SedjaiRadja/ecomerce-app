const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addProductToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).send("invalid product id or quantity");
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).send("Quantity must be a positive integer");
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("product not found");
    }
    if(quantity > product.stock) {
      return res.status(400).send("Not enough stock available !")
    }
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      const newCart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
          },
        ],
      });
      return res.status(201).json({
        message: "Product added to cart successfully",
        cart: newCart,
      });
    }

    const p = cart.items.find((item) => item.product.toString() === productId);
    if (p) {
      const newQuantity = p.quantity + quantity;
      if(newQuantity>product.stock){
        return res.status(400).send("Not enough stock available");
      }
      p.quantity += quantity;
    } else {
        cart.items.push({
          product: productId,
          quantity,
        });
      
    }
    await cart.save();
    return res.status(200).json({
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).send("it can't be added");
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).send("cart not found");
    }
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to fetch cart");
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).send("Product ID is required");
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).send("Quantity must be a positive integer");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    const productCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!productCart) {
      return res.status(404).send("Product not found in cart");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (quantity > product.stock) {
      return res.status(400).send("Not enough stock available");
    }

    productCart.quantity = quantity;

    await cart.save();

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).send("it can't be updated");
  }
};

const removeProductToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).send("invalid product id or quantity");
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json("cart not found");
    }

    const productIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex === -1) {
      return res.status(404).send("Product not found in cart");
    }
    cart.items.splice(productIndex, 1);
    await cart.save();
    return res.status(200).send("Product removed from cart successfully");
  } catch (error) {
    return res.status(500).send("it can't be removed");
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json("cart not found");
    }
    cart.items = [];
    await cart.save();
    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).send("Failed to clear cart");
  }
};

module.exports = {
  addProductToCart,
  getCart,
  updateCartQuantity,
  removeProductToCart,
  clearCart,
};
