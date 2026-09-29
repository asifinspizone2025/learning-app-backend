const express = require('express');
const uploadDocument = require('../middleware/documentUploadMiddleware');
const {
  createNote,
  getNotesBySubject,
  deleteNote,
  uploadNoteFile,
  getAllNotesGrouped,
} = require('../controllers/noteController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/upload-only', protect, isAdmin, uploadDocument.single('file'), uploadNoteFile);
router.post('/', protect, isAdmin, createNote);
router.get('/all', getAllNotesGrouped);
router.get('/subject/:subjectId', getNotesBySubject);
router.delete('/:id', protect, isAdmin, deleteNote);

module.exports = router;