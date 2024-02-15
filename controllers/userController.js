const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/userModel');

const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlersFactory');

const generateToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  return token;
};

// @desc    Create user
// @route   POST /api/users
// @access  Private

exports.createUser = createOne(User);

// @desc    Get all users
// @route   GET /api/users
// @access  Private

exports.getAllUsers = getAll(User);

// @desc    Get Specific user
// @route   GET /api/users/:id
// @access  Private

exports.getUser = getOne(User);

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private

exports.updateUser = expressAsyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: 'success', data: document });
});

// @desc    Update user password
// @route   PATCH /api/users/:id
// @access  Private

exports.changeUserPassword = expressAsyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: 'success', data: document });
});
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private

exports.deleteUser = deleteOne(User, 'User');

// @desc    Get logged user data
// @route   DELETE /api/users/getMe
// @access  Private/Protect

exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   DELETE /api/users/changeMyPassword
// @access  Private/Protect

exports.changeMyPassword = expressAsyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.user._id}`, 404));
  }

  const token = generateToken({ userId: req.user._id });
  res.status(200).json({ status: 'success', document, token });
});

// @desc    Update logged user data
// @route   DELETE /api/users/updateMe
// @access  Private/Protect

exports.updateLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.user._id}`, 404));
  }
  res.status(200).json({ status: 'success', data: document });
});
