const express = require('express');

const {
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  createUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validatores/userValidator');

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserData,
  changeMyPassword,
} = require('../controllers/userController');

const { protect, allowedTo } = require('../controllers/authController');

const router = express.Router();

router.patch(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword,
);

router.use(protect);
router.get('/getMe', getLoggedUserData, getUser);

router.patch('/changeMyPassword', changeMyPassword);
router.patch('/updateMe', updateLoggedUserValidator, updateLoggedUserData);

router
  .route('/')
  .get(allowedTo('admin'), getAllUsers)
  .post(allowedTo('admin'), createUserValidator, createUser);

router
  .route('/:id')
  .get(allowedTo('admin'), getUserValidator, getUser)
  .patch(allowedTo('admin'), updateUserValidator, updateUser)
  .delete(allowedTo('admin'), deleteUserValidator, deleteUser);

module.exports = router;
