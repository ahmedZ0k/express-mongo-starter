const crypto = require('crypto');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

const generateToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  return token;
};

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public

exports.signup = expressAsyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = generateToken({ userId: user._id });

  res.status(201).json({ token, data: user });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public

exports.login = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('email and password are required', 400));
  }
  const user = await User.findOne({ email });

  if (user) {
    const checker = await bcrypt.compare(password, user.password);

    if (!checker) {
      return next(new ApiError('incorrect password', 400));
    }
  } else {
    return next(
      new ApiError('there is no user with this email, please sign up', 400),
    );
  }
  const token = generateToken({ userId: user._id });

  res.status(200).json({ token, data: user });
});

// @desc    (Authentication) make sure the user is logged in
exports.protect = expressAsyncHandler(async (req, res, next) => {
  // 1) Check if token exist
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return next(new ApiError('you are not logged in'), 401);
  }
  const token = req.headers.authorization.split(' ')[1];
  //  2) verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if user exist
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(
      new ApiError('user that belong to this token is no longer exist', 401),
    );
  }

  // 4) Check if the password changed
  if (user.passwordChangedAt) {
    const passwordChangedAtTimeInSeconds = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10,
    );
    if (passwordChangedAtTimeInSeconds > decoded.iat) {
      return next(
        new ApiError(
          'the password has changed recently, please login again',
          401,
        ),
      );
    }
  }

  req.user = user;
  next();
});

// @desc    (Authorization)
exports.allowedTo = (...roles) =>
  expressAsyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 401),
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/auth/forgotPassword
// @access  Public

exports.forgotPassword = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(`there is no user with this email ${email}`, 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hasedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  user.passwordResetCode = hasedResetCode;
  user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const emailOptions = {
    email: user.email,
    subject: 'Reset Password Code (Valid for 10min)',
    html: `<div>
    <h1>Hi ${user.name},</h1>
    <p>Enter this code to complete the reset.</p>
    <strong>${resetCode}</strong>
    <p>When this happened</p>
    <small> Date:${new Date().toJSON()}</small>
    </div>`,
  };
  try {
    await sendEmail(emailOptions);
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    next(new ApiError('there is a problem in sending email', 500));
  }
  res.status(200).json({ res: 'please check your mail' });
});

// @desc    Verify Password Reset Code
// @route   POST /api/auth/verifyPasswordResetCode
// @access  Public

exports.verifyPasswordResetCode = expressAsyncHandler(
  async (req, res, next) => {
    const { resetCode } = req.body;

    const hasedResetCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
    const user = await User.findOne({
      passwordResetCode: hasedResetCode,
      passwordResetCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError('Invalid or Expired password reset code'));
    }

    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({ status: 'success' });
  },
);

// @desc    Reset Password
// @route   POST /api/auth/resetPassword
// @access  Public

exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(`no user found with this email ${email}`));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError(`password reset code not verified`));
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  const token = generateToken({ userId: user._id });
  res
    .status(200)
    .json({ status: 'success', message: 'password reset successfully', token });
});
