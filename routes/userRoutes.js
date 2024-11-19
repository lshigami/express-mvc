const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET routes
router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.get('/me', userController.me);

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/users/login');
});

// POST routes
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;