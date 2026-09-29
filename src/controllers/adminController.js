const User = require('../models/User');

// Get all registered students (excludes password field)
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get dashboard summary counts
const getDashboardStats = async (req, res) => {
  try {
    const Category = require('../models/Category');
    const Subject = require('../models/Subject');
    const Course = require('../models/Course');

    const [studentCount, categoryCount, subjectCount, courseCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Category.countDocuments(),
      Subject.countDocuments(),
      Course.countDocuments(),
    ]);

    return res.status(200).json({
      studentCount,
      categoryCount,
      subjectCount,
      courseCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Toggle a student's blacklist status
const toggleBlacklist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    user.isBlacklisted = !user.isBlacklisted;
    await user.save();

    return res.status(200).json({
      message: user.isBlacklisted ? 'Student blacklisted' : 'Student removed from blacklist',
      isBlacklisted: user.isBlacklisted,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a student account
const deleteStudent = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Edit basic student details
const editStudent = async (req, res) => {
  try {
    const { name, email, grade, phoneNumber } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (grade !== undefined) user.grade = grade;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();
    return res.status(200).json({ message: 'Student updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getDashboardStats,
  toggleBlacklist,
  deleteStudent,
  editStudent,
};