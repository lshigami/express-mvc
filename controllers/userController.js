const passport = require("passport");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

exports.register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    req.flash("success", "Registration successful! Please log in.");
    res.redirect("/users/login");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.render("users/register", {
        error: "Email already exists",
        username: req.body.username,
        email: req.body.email,
      });
    } else {
      res.render("users/register", {
        error: "Registration failed. Please try again.",
        username: req.body.username,
        email: req.body.email,
      });
    }
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/products",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
};

exports.me = async (req, res) => {
  try {
    res.render("users/me", { user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/users/login");
  });
};
