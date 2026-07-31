const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findOne({ name });
    if (product) {
      return res.status(400).send("product already exist");
    }
    if (!req.file) {
      return res.status(400).send("Product image is required");
    }
    const uploadImage = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const newProduct = await Product.create({
      name,
      description,
      price,
      image: uploadImage.secure_url,
      category,
      stock,
    });
    res.status(201).json({
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to create product");
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    let filters = {};

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Search
    if (search) {
      filters.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Category Filter
    if (category) {
      filters.category = {
        $regex: category,
        $options: "i",
      };
    }

    // Price Filter
    if (minPrice || maxPrice) {
      filters.price = {};

      if (minPrice) {
        filters.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filters.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filters).skip(skip).limit(limitNumber);

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    if (products.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalProducts,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    });
  } catch (error) {
    return res.status(500).send("There's a problem when fetching data");
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

    // Find the product first
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Extract Cloudinary public_id
    const imageUrl = product.image;
    const parts = imageUrl.split("/");
    const fileName = parts.pop().split(".")[0];
    const folder = parts.pop();
    const publicId = `${folder}/${fileName}`;

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete product from MongoDB
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to delete product");
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
