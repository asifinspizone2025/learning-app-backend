const express = require('express');
const {
  createSubject,
  getSubjectsByCategory,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, createSubject);
router.get('/category/:categoryId', getSubjectsByCategory);
router.put('/:id', protect, isAdmin, updateSubject);
router.delete('/:id', protect, isAdmin, deleteSubject);

module.exports = router;