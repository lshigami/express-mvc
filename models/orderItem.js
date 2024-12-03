module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1, // Đảm bảo số lượng ít nhất là 1
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0, // Giá không được âm
        },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // Nếu muốn tự động tính toán
        get() {
          return (this.quantity * this.price).toFixed(2);
        },
      },
    },
    {
      timestamps: true,
      // Thêm index để tăng hiệu suất truy vấn
      indexes: [{ fields: ["orderId"] }, { fields: ["productId"] }],
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: "orderId",
      onDelete: "CASCADE", // Nếu order bị xóa, các orderItem liên quan cũng bị xóa
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: "productId",
      onDelete: "RESTRICT", // Không cho phép xóa sản phẩm nếu còn trong orderItem
    });
  };

  return OrderItem;
};
