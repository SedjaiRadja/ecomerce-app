const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    // Check shipping address
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.wilaya ||
      !shippingAddress.phone
    ) {
      return res.status(400).send("Complete shipping address is required");
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    // Check if cart is empty
    if (cart.items.length === 0) {
      return res.status(400).send("Cannot create an order from an empty cart");
    }

    let totalPrice = 0;
    const orderItems = [];

    // Get products and calculate total price
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).send("Product not found");
      }

      const itemTotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += itemTotal;
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
    });

    // Clear cart after successful order creation
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to create order");
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId });

    if (orders.length === 0) {
      return res.status(404).send("No orders found");
    }

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to fetch orders");
  }
};

const getMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send("Invalid order ID");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    return res.status(500).send("Failed to fetch order");
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });
    if (!order) {
      return res.status(404).send("order not found");
    }
    if (order.status !== "pending") {
      return res.status(400).send("you can't cancel the order");
    }
    order.status = "cancelled";
    await order.save();
    res.status(200).json({ message: "it was cancelled succesfully", order });
  } catch (error) {
    return res.status(500).send("Failed to cancel order");
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
};
