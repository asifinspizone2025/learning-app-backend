const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), uploadImage);

module.exports = router;