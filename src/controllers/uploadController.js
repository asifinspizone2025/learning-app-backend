// With Cloudinary storage, multer already uploads the file and attaches
// its public URL to req.file.path — no need to build a URL manually.
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  return res.status(200).json({ url: req.file.path });
};

module.exports = { uploadImage };