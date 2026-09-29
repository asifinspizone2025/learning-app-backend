const Note = require('../models/Note');

// Determine a simple fileType category from the uploaded file's mimetype
const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'doc';
  }
  return 'image';
};

// Upload a note file and create its database entry in one step
// const createNote = async (req, res) => {
//   try {
//     const { title, subject } = req.body;

//     if (!title || !subject) {
//       return res.status(400).json({ message: 'Title and subject are required' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const host = process.env.SERVER_HOST || req.hostname;
//     const port = process.env.PORT || 5000;
//     const fileUrl = `http://${host}:${port}/uploads/${req.file.filename}`;
//     const fileType = getFileType(req.file.mimetype);

//     const note = await Note.create({ title, subject, fileUrl, fileType });
//     return res.status(201).json(note);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };



// Create a note entry from an already-uploaded file URL
const createNote = async (req, res) => {
  try {
    const { title, subject, fileUrl, fileType } = req.body;

    if (!title || !subject || !fileUrl || !fileType) {
      return res.status(400).json({
        message: 'Title, subject, fileUrl and fileType are required',
      });
    }

    const note = await Note.create({ title, subject, fileUrl, fileType });
    return res.status(201).json(note);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all notes belonging to a subject
const getNotesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const notes = await Note.find({ subject: subjectId }).sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Uploads a file and returns its URL + type without creating a Note yet.
// Used by the admin portal so the file can be uploaded as soon as it's
// selected, before the title is even typed.
const uploadNoteFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const host = process.env.SERVER_HOST || req.hostname;
  const port = process.env.PORT || 5000;
  const fileUrl = `http://${host}:${port}/uploads/${req.file.filename}`;
  const fileType = getFileType(req.file.mimetype);

  return res.status(200).json({ url: fileUrl, fileType });
};

// Get all notes across all subjects, grouped for easy display.
// Populates subject title so the mobile app can group notes by subject
// without making extra requests.
const getAllNotesGrouped = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('subject', 'title icon')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  getNotesBySubject,
  deleteNote,
  uploadNoteFile,
  getAllNotesGrouped,
};