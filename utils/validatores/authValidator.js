const { check } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.signupValidator = [
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

  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email address'),

  check('password').notEmpty().withMessage('password required'),

  validatorMiddleware,
];
