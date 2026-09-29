const express = require('express');
const {
  getAllStudents,
  getDashboardStats,
  toggleBlacklist,
  deleteStudent,
  editStudent,
} = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/students', protect, isAdmin, getAllStudents);
router.get('/stats', protect, isAdmin, getDashboardStats);
router.put('/students/:id/blacklist', protect, isAdmin, toggleBlacklist);
router.delete('/students/:id', protect, isAdmin, deleteStudent);
router.put('/students/:id', protect, isAdmin, editStudent);

module.exports = router;