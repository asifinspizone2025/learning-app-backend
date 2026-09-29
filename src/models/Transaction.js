const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'refunded', 'cancelled'],
      default: 'success',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
    },
    refundReason: { type: String },
    addedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);