const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const latestOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const ordersByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedOrdersByMonth = ordersByMonth.map((item) => ({
      month: monthNames[item._id],
      orders: item.orders,
    }));

    const formattedOrdersByStatus = ordersByStatus.map((item) => ({
      status: item._id,
      count: item.count,
    }));
    res.status(200).json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      latestOrders,
      ordersByStatus: formattedOrdersByStatus,
      ordersByMonth: formattedOrdersByMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch dashboard statistics");
  }
};

module.exports = { getDashboardStats };
