const { User } = require("../models");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    
    res.render('users/login', {
      success: 'Registration successful! Click OK to proceed to login.',
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.render('users/register', {
        error: 'Username or email already exists',
        username: req.body.username,
        email: req.body.email
      });
    } else {
      res.render('users/register', {
        error: 'Registration failed. Please try again.',
        username: req.body.username,
        email: req.body.email
      });
    }
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.redirect("/users/login"); 
    }
    res.render("users/me", { user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("users/login", { 
        error: "Please fill in all fields" 
      });
    }

    const user = await User.findOne({ where: { username } });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user.id;
      req.session.username = user.username;
      
      return res.redirect("/products");
    } 

    res.render("users/login", { 
      error: "Invalid username or password" 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.render("users/login", { 
      error: "An error occurred. Please try again." 
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect("/");
  });
};
