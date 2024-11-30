const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/login", (req, res) => res.render("users/login"));
router.post("/login", userController.login);

router.get("/register", (req, res) => res.render("users/register"));
router.post("/register", userController.register);

router.get("/me", userController.me);
router.get("/logout", userController.logout);

module.exports = router;
