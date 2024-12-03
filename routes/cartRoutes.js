const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

router.get("/", isAuthenticated, cartController.renderCartPage);
router.get("/items", isAuthenticated, cartController.getCart);
router.post("/add", isAuthenticated, cartController.addToCart);
router.get("/count", isAuthenticated, cartController.getCartCount);
router.delete("/remove/:id", isAuthenticated, cartController.removeFromCart);
router.patch("/update/:id", isAuthenticated, cartController.updateCartItem);

module.exports = router;
