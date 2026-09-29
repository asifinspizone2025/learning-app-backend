const express = require('express');
const {
  getMySubscriptions,
  requestRefund,
  getAllTransactions,
  addCashSubscription,
  approveRefund,
  rejectRefund,
} = require('../controllers/subscriptionController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

// Student routes
router.get('/my', protect, getMySubscriptions);
router.post('/:id/refund-request', protect, requestRefund);

// Admin routes
router.get('/all', protect, isAdmin, getAllTransactions);
router.post('/cash', protect, isAdmin, addCashSubscription);
router.post('/:id/approve-refund', protect, isAdmin, approveRefund);
router.post('/:id/reject-refund', protect, isAdmin, rejectRefund);

module.exports = router;