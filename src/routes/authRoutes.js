const express = require('express');
const {
  initiateRegistration,
  verifyOtpAndRegister,
  resendOtp,
  loginUser,
  getMyProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', initiateRegistration);
router.post('/verify-otp', verifyOtpAndRegister);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMyProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;