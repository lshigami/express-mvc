const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

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
router.get('/me', authMiddleware, userController.me);
router.get('/logout', userController.logout);

module.exports = router;