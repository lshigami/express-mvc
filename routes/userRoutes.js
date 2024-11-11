const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Thêm middleware kiểm tra đăng nhập cho route me
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

router.get('/register', (req, res) => res.render('users/register'));
router.post('/register', userController.register);
router.get('/login', (req, res) => res.render('users/login'));
router.post('/login', userController.login);
router.get('/me', authMiddleware, userController.me);  // Thêm middleware auth
router.get('/logout', userController.logout);

module.exports = router;