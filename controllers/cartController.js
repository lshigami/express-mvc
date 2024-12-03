const db = require("../models");
const Cart = db.Cart;
const Product = db.Product;
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

exports.renderCartPage = (req, res) => {
  res.render("cart/cart", {
    user: req.user,
  });
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.Product.price) * item.quantity;
    }, 0);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(200).json({
        items: cartItems,
        total: total.toFixed(2),
      });
    }

    res.render("cart/cart", {
      cartItems: cartItems,
      total: total.toFixed(2),
      user: req.user,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        error: "Failed to retrieve cart",
        details: error.message,
      });
    }

    res.status(500).render("error", {
      message: "Failed to retrieve cart",
      error: error.message,
    });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        quantity: quantity,
      });
    }

    const updatedCart = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price"],
        },
      ],
    });

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      error: "Failed to add product to cart",
      details: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  try {
    if (!productId) {
      return res.status(400).json({ error: "Missing productId in request" });
    }

    const result = await Cart.destroy({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    if (result > 0) {
      return res
        .status(200)
        .json({ message: "Product removed from cart successfully" });
    } else {
      return res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to remove product from cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findOne({
      where: { userId, productId: id },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cart item updated successfully",
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update cart item",
      details: error.message,
    });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ totalQuantity: 0 });
    }

    const cartItems = await Cart.findAll({
      where: {
        userId: req.user.id,
      },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalQuantity"],
      ],
      raw: true,
    });

    const totalQuantity = cartItems[0].totalQuantity || 0;

    res.json({ totalQuantity });
  } catch (error) {
    console.error("Error getting cart count:", error);
    res.status(500).json({ totalQuantity: 0 });
  }
};
