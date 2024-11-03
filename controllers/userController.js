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
    res.redirect("/users/login");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.redirect("/users/login"); 
    }
    res.render("users/me", { user });  // Truyền dữ liệu user vào view : MVC pattern
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      return res.redirect("/products");
    } else {
      res.render("users/login", { error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
