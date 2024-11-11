require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./models");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  next();
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }
  next();
};

// Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/products", authMiddleware, productRoutes);
app.use("/users", userRoutes);

// Start server
db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});
