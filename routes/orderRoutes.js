const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

router.post("/create", isAuthenticated, orderController.createOrder);
router.get("/history", isAuthenticated, orderController.getOrderHistory);
router.get("/confirmation/:orderId", orderController.getOrderConfirmation);

module.exports = router;
