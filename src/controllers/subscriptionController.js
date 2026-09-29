const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

// Student: get their own subscription history
const getMySubscriptions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('category', 'title icon price')
      .sort({ createdAt: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Student: request a refund/cancellation for a subscription
const requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (transaction.status !== 'success') {
      return res.status(400).json({ message: 'This subscription is not eligible for refund' });
    }

    transaction.refundStatus = 'requested';
    transaction.refundReason = reason || '';
    await transaction.save();

    return res.status(200).json({ message: 'Refund request submitted', transaction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: get all transactions, with student and category populated
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('category', 'title')
      .sort({ createdAt: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: manually add a subscription (e.g. cash payment collected in person)
const addCashSubscription = async (req, res) => {
  try {
    const { userId, categoryId, amount } = req.body;

    if (!userId || !categoryId) {
      return res.status(400).json({ message: 'userId and categoryId are required' });
    }

    const user = await User.findById(userId);
    const category = await Category.findById(categoryId);

    if (!user || !category) {
      return res.status(404).json({ message: 'User or category not found' });
    }

    if (!user.purchasedCategories.some((id) => id.toString() === categoryId)) {
      user.purchasedCategories.push(categoryId);
      await user.save();
    }

    const transaction = await Transaction.create({
      user: userId,
      category: categoryId,
      amount: amount || category.price,
      paymentMethod: 'cash',
      status: 'success',
      addedByAdmin: req.user._id,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: approve a refund request — removes the category access and marks refunded
const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'refunded';
    transaction.refundStatus = 'approved';
    await transaction.save();

    const user = await User.findById(transaction.user);
    user.purchasedCategories = user.purchasedCategories.filter(
      (id) => id.toString() !== transaction.category.toString()
    );
    await user.save();

    return res.status(200).json({ message: 'Refund approved', transaction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: reject a refund request
const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.refundStatus = 'rejected';
    await transaction.save();

    return res.status(200).json({ message: 'Refund request rejected', transaction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMySubscriptions,
  requestRefund,
  getAllTransactions,
  addCashSubscription,
  approveRefund,
  rejectRefund,
};