const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const product = await Product.findOne({ name });
    if (product) {
      return res.status(400).send("product already exist");
    }
    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock,
    });
    res.status(201).json({
      message: "it was created",
      newProduct,
    });
  } catch (error) {
    return res.status(500).send("it wasn't created");
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let filters = {};

    if (search) {
      filters.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (category) {
      filters.category = {
        $regex: category,
        $options: "i",
      };
    }
    if (minPrice || maxPrice) {
      filters.price = {};

      if (minPrice) {
        filters.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filters.price.$lte = Number(maxPrice);
      }
    }
    const allProduct = await Product.find(filters);
    if (allProduct.length === 0) {
      res.status(200).json([]);
    }
    res.status(200).json(allProduct);
  } catch (error) {
    return res.status(500).send("there's a problem when fetching data");
  }
};

const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).send("product not found");
  }
  res.status(200).send(product);
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).send("product not found");
    }
    res.status(200).send(product);
  } catch (error) {
    return res.status(500).send("it can't be updated");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).send("product not found");
    }
    res.status(200).send("it was deleted sucssefully");
  } catch (error) {
    return res.status(500).send("it can't be deleted");
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
