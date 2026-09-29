const Subject = require('../models/Subject');

// Create a new subject under a category (e.g. HTML under Web Development)
const createSubject = async (req, res) => {
  try {
    const { title, category, icon, colorTag } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: 'Title and category are required',
      });
    }

    const subject = await Subject.create({ title, category, icon, colorTag });
    return res.status(201).json(subject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all subjects belonging to a category
const getSubjectsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subjects = await Subject.find({ category: categoryId });
    return res.status(200).json(subjects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { title, icon, colorTag } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (title !== undefined) subject.title = title;
    if (icon !== undefined) subject.icon = icon;
    if (colorTag !== undefined) subject.colorTag = colorTag;

    await subject.save();
    return res.status(200).json(subject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjectsByCategory,
  updateSubject,
  deleteSubject,
};