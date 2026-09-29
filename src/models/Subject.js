const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    icon: {
      type: String,
      default: '📘',
    },
    colorTag: {
      type: String,
      default: '#9A145A',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);