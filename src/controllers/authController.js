const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Otp = require('../models/Otp');
const sendOtpEmail = require('../utils/sendEmail');

// Register a new student account
const initiateRegistration = async (req, res) => {
  try {
    const { name, email, password, gender, dateOfBirth, grade, phoneNumber, categoryId } =
      req.body;

    if (!name || !email || !password || !gender || !dateOfBirth || !categoryId) {
      return res.status(400).json({
        message:
          'Name, email, password, gender, date of birth and category are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Remove any previous pending OTP for this email before creating a new one
    await Otp.deleteMany({ email: email.toLowerCase() });

    await Otp.create({
      email: email.toLowerCase(),
      otp,
      signupData: { name, email, password, gender, dateOfBirth, grade, phoneNumber, categoryId },
    });

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Verifies the OTP and, if correct, creates the actual User account
// using the signup data that was stored when the OTP was requested.
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const { name, password, gender, dateOfBirth, grade, phoneNumber, categoryId } =
      otpRecord.signupData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      gender,
      dateOfBirth,
      grade,
      phoneNumber,
      freeCategory: categoryId,
      purchasedCategories: [categoryId],
    });

    await Otp.deleteMany({ email: email.toLowerCase() });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        grade: user.grade,
        phoneNumber: user.phoneNumber,
        freeCategory: user.freeCategory,
        purchasedCategories: user.purchasedCategories,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Resends a fresh OTP using the signup data already stored for this email
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingOtp = await Otp.findOne({ email: email.toLowerCase() });
    if (!existingOtp) {
      return res.status(400).json({
        message: 'No pending signup found for this email. Please start signup again.',
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    existingOtp.otp = otp;
    existingOtp.createdAt = new Date();
    await existingOtp.save();

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP resent to your email' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login an existing student
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

       const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        grade: user.grade,
        phoneNumber: user.phoneNumber,
        freeCategory: user.freeCategory,
        purchasedCategories: user.purchasedCategories,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get currently logged in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      grade: user.grade,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      freeCategory: user.freeCategory,
      purchasedCategories: user.purchasedCategories,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update profile details
const updateProfile = async (req, res) => {
  try {
    const { name, grade, phoneNumber, profilePhoto } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (grade !== undefined) user.grade = grade;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      grade: user.grade,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      freeCategory: user.freeCategory,
      purchasedCategories: user.purchasedCategories,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initiateRegistration,
  verifyOtpAndRegister,
  resendOtp,
  loginUser,
  getMyProfile,
  updateProfile,
  changePassword,
};