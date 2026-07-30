const Product = require("../models/Product");
const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).send("User not authenticated");
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      const newWishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });

      return res.status(201).json({
        message: "Product added to wishlist successfully",
        wishlist: newWishlist,
      });
    }

    const productExists = wishlist.products.some(
      (product) => product.toString() === productId,
    );

    if (productExists) {
      return res.status(400).send("Product already exists in wishlist");
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return res.status(200).json({
      message: "Product added to wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to add product to wishlist");
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).send("no user found");
    }
    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products",
      "name image price category",
    );
    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: [],
      });
    }
    res.status(200).json({
      message: "wish list fetched succesfully",
      wishlist,
    });
  } catch (error) {
    return res.status(500).send("failed to fetched the wish list");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).send("User not authenticated");
    }

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid product ID");
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: [],
      });
    }

    wishlist.products = wishlist.products.filter(
      (product) => product.toString() !== productId,
    );

    await wishlist.save();

    return res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to remove product from wishlist");
  }
};

const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
      });
    }

    wishlist.products = [];
    await wishlist.save();

    return res.status(200).json({
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    return res.status(500).send("Failed to clear wishlist");
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
};
