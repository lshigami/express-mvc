const { Order, OrderItem, Cart, Product, sequelize } = require("../models");

module.exports = {
  createOrder: async (req, res) => {
    const userId = req.user.id;
    let transaction;

    try {
      console.log("Starting checkout process for user:", userId);

      transaction = await sequelize.transaction();

      const cartItems = await Cart.findAll({
        where: { userId },
        include: [{ model: Product }],
      });

      console.log("Cart items found:", cartItems.length);

      cartItems.forEach((item, index) => {
        console.log(`Cart Item ${index + 1}:`, {
          productId: item.productId,
          quantity: item.quantity,
          productPrice: item.Product?.price,
          productName: item.Product?.name,
        });
      });

      if (cartItems.length === 0) {
        await transaction.rollback();

        const acceptHeader = req.headers["accept"];
        if (acceptHeader && acceptHeader.includes("application/json")) {
          return res.status(400).json({
            success: false,
            message: "Cart is empty",
          });
        } else {
          req.flash("error", "Cart is empty");
          return res.redirect("/cart");
        }
      }

      const totalAmount = cartItems.reduce((total, item) => {
        return total + item.quantity * item.Product.price;
      }, 0);

      console.log("Total Amount:", totalAmount);

      console.log("Creating order with data:", {
        userId,
        totalAmount,
        status: "PENDING",
      });

      const order = await Order.create(
        {
          userId,
          totalAmount,
          status: "PENDING",
        },
        { transaction }
      );

      console.log("Order created with ID:", order.id);

      const orderItems = cartItems.map((cartItem) => {
        const orderItemData = {
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.Product.price,
          subtotal: cartItem.quantity * cartItem.Product.price,
        };

        console.log("Order Item being created:", orderItemData);
        return orderItemData;
      });

      const validOrderItems = orderItems.filter(
        (item) => item.productId && item.quantity > 0 && item.price >= 0
      );

      if (validOrderItems.length === 0) {
        throw new Error("No valid order items to create");
      }

      await OrderItem.bulkCreate(validOrderItems, { transaction });

      console.log("Order items created successfully");

      await Cart.destroy({
        where: { userId },
        transaction,
      });

      console.log("Cart cleared successfully");

      await transaction.commit();

      console.log("Transaction committed successfully");

      const acceptHeader = req.headers["accept"] || "";
      console.log("Full accept header:", acceptHeader);

      if (!acceptHeader.toLowerCase().includes("application/json")) {
        console.log("Redirecting to confirmation page");
        return res.redirect(`orders/confirmation/${order.id}`);
      }

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: order.id,
        redirectUrl: `orders/confirmation/${order.id}`,
      });
    } catch (error) {
      console.error("===== CHECKOUT ERROR START =====");
      console.error("User ID:", userId);
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);

      if (error.errors) {
        console.error(
          "Validation Errors:",
          error.errors.map((err) => ({
            message: err.message,
            type: err.type,
            path: err.path,
          }))
        );
      }

      if (transaction) {
        try {
          await transaction.rollback();
          console.log("Transaction rolled back");
        } catch (rollbackError) {
          console.error("Rollback error:", rollbackError);
        }
      }

      console.error("===== CHECKOUT ERROR END =====");

      const acceptHeader = req.headers["accept"];
      if (acceptHeader && acceptHeader.includes("application/json")) {
        return res.status(500).json({
          success: false,
          message: `Checkout failed: ${error.message}`,
          error: error.toString(),
        });
      } else {
        req.flash("error", `Checkout failed: ${error.message}`);
        res.redirect("/cart");
      }
    }
  },

  getOrderHistory: async (req, res) => {
    try {
      const userId = req.user.id;

      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [Product],
            as: "OrderItems",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const ordersJson = orders.map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        OrderItems: order.OrderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          Product: {
            id: item.Product.id,
            name: item.Product.name,
          },
        })),
      }));

      const acceptHeader = req.headers["accept"];
      if (acceptHeader && acceptHeader.includes("application/json")) {
        return res.json(ordersJson);
      }

      res.render("orders/order-history", { orders });
    } catch (error) {
      console.error("Error fetching order history:", error);

      const acceptHeader = req.headers["accept"];
      if (acceptHeader && acceptHeader.includes("application/json")) {
        return res.status(500).json({
          error: "Failed to fetch order history",
          details: error.message,
        });
      }

      req.flash("error", "Failed to fetch order history");
      res.redirect("/");
    }
  },

  getOrderConfirmation: async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
        ],
      });

      if (!order) {
        req.flash("error", "Order not found");
        return res.redirect("/orders/order-history");
      }

      res.render("orders/order-confirmation", {
        order: order,
        title: "Order Confirmation",
      });
    } catch (error) {
      console.error("Error fetching order confirmation:", error);
      req.flash("error", "Failed to fetch order details");
      res.redirect("/orders/order-history");
    }
  },
};
