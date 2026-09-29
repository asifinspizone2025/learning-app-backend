const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    instructorName: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    videoSource: {
      type: String,
      enum: ['youtube', 'drive'],
      required: true,
      default: 'youtube',
    },
    youtubePlaylistId: {
      type: String,
      trim: true,
    },
    // A single Google Drive folder ID containing all lecture videos.
    // Videos inside are fetched live via the Drive API, same pattern
    // as the YouTube playlist.
    driveFolderId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);