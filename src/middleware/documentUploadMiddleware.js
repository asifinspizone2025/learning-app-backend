const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Uploads note documents (PDF, DOC/DOCX, images) directly to Cloudinary.
// resource_type "auto" lets Cloudinary correctly handle non-image files
// like PDFs and Word documents, which it treats as "raw" resources.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'learning-app/notes',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC/DOCX and image files are allowed'));
  }
};

const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max for documents
});

module.exports = uploadDocument;