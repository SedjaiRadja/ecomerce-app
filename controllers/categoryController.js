const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findOne({ name });

    if (category) {
      return res.status(400).send("A category with this name already exists");
    }

    const newCategory = await Category.create({
      name,
      description,
      image,
    });

    res.status(201).json({
      message: "Category created successfully",
      newCategory,
    });
  } catch (error) {
    return res.status(500).send("Failed to create the category");
  }
};

const getCategories = async (req, res) => {
  try {
    const allCategories = await Category.find();

    if (allCategories.length === 0) {
      return res.status(404).send("No categories found");
    }

    res.status(200).json(allCategories);
  } catch (error) {
    return res.status(500).send("Failed to fetch categories");
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).send(category);
  } catch (error) {
    return res.status(500).send("Failed to fetch the category");
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).send(category);
  } catch (error) {
    return res.status(500).send("Failed to update the category");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).send("Category deleted successfully");
  } catch (error) {
    return res.status(500).send("Failed to delete the category");
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
