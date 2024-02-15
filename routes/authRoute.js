const express = require('express');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validatores/authValidator');

const {
  signup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyPasswordResetCode', verifyPasswordResetCode);
router.patch('/resetPassword', resetPassword);

module.exports = router;
