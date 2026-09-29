const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '📚',
    },
    colorTag: {
      type: String,
      default: '#9A145A',
    },
        price: {
      type: Number,
      default: 499, // in Rupees
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);