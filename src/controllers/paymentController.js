const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Creates a Razorpay order for unlocking a specific category
const createOrder = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: 'categoryId is required' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Already purchased? No need to pay again
    if (req.user.purchasedCategories.some((id) => id.toString() === categoryId)) {
      return res.status(400).json({ message: 'Category already unlocked' });
    }

    const order = await razorpayInstance.orders.create({
      amount: category.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `cat_${categoryId}_${Date.now()}`,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      categoryTitle: category.title,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Verifies the Razorpay payment signature and unlocks the category
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      categoryId,
    } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const user = await User.findById(req.user._id);
    const category = await Category.findById(categoryId);

    if (!user.purchasedCategories.some((id) => id.toString() === categoryId)) {
      user.purchasedCategories.push(categoryId);
      await user.save();
    }

    await Transaction.create({
      user: user._id,
      category: categoryId,
      amount: category.price,
      paymentMethod: 'razorpay',
      status: 'success',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return res.status(200).json({
      message: 'Category unlocked successfully',
      purchasedCategories: user.purchasedCategories,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };