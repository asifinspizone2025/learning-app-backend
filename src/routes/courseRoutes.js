const express = require('express');
const {
  createCourse,
  getCoursesBySubject,
  getCourseVideos,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, createCourse);
router.get('/subject/:subjectId', getCoursesBySubject);
router.get('/:courseId/videos', getCourseVideos);
router.put('/:id', protect, isAdmin, updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);

module.exports = router;