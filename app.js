require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./models");
const upload = require("./middlewares/multer");

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

app.get('/categories', (req, res) => {
  res.render('categories/index');
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    const filePath = req.file ? `/uploads/${req.file.filename}` : null; // Đường dẫn file
    res.status(200).json({ message: "Upload successful", filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.set("views", path.join(__dirname, "views"));
app.get("/users/forgot-password", (req, res) => {
  res.render("users/forgot-password"); 
});
app.use("/products", authMiddleware, productRoutes);
app.use("/users", userRoutes);

// Middleware xử lý 404 - Đặt ở cuối cùng, sau tất cả các routes khác
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

// Start server
db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3000");
    console.log("Client running on http://localhost:3001");
  });
});
