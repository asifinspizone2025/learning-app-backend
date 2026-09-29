const Category = require('../models/Category');

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { title, icon, colorTag } = req.body;

    if (!title || !icon) {
      return res.status(400).json({
        message: 'Title and icon are required',
      });
    }

    const category = await Category.create({ title, icon, colorTag });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single category by id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing category
const updateCategory = async (req, res) => {
  try {
    const { title, icon, colorTag } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (title !== undefined) category.title = title;
    if (icon !== undefined) category.icon = icon;
    if (colorTag !== undefined) category.colorTag = colorTag;

    await category.save();
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};