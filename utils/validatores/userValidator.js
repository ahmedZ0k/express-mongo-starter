const { check } = require('express-validator');
const { default: slugify } = require('slugify');
const bcrypt = require('bcryptjs');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id'),
  validatorMiddleware,
];

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name required')
    .isLength({ min: 3 })
    .withMessage('too short User name')
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email address')
    .custom(async value => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('email already exists');
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm').notEmpty().withMessage('password confirm required'),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('invalid phone number only accept EG and SA phone numbers'),

  check('profileImg').optional(),

  check('role').optional(),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id'),
  check('name')
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email address')
    .custom(async value => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('email already exists');
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('invalid phone number only accept EG and SA phone numbers'),

  check('profileImg').optional(),

  check('role').optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('invalid user id format'),

  check('currentPassword').notEmpty().withMessage('current password required'),

  check('password')
    .notEmpty()
    .withMessage('password required')
    .custom(async (value, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error('there is no user for this id');
      }
      const checker = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!checker) {
        throw new Error('incorrect current password');
      }
      if (value !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm').notEmpty().withMessage('password confirm required'),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id'),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check('name')
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check('email')
    .optional()
    .isEmail()
    .withMessage('invalid email address')
    .custom(async value => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('email already exists');
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('invalid phone number only accept EG and SA phone numbers'),

  validatorMiddleware,
];
