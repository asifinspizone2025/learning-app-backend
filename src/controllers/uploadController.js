// Returns the public URL of the uploaded file so it can be saved
// directly into a category/subject/course document. Uses SERVER_HOST
// (a LAN IP) instead of the request's host header, so the URL works
// consistently whether accessed from the admin portal (browser) or the
// mobile app (phone on the same network).
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const host = process.env.SERVER_HOST || req.hostname;
  const port = process.env.PORT || 5000;
  const fileUrl = `http://${host}:${port}/uploads/${req.file.filename}`;

  return res.status(200).json({ url: fileUrl });
};

module.exports = { uploadImage };