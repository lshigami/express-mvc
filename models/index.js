const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./user")(sequelize, Sequelize);
db.Product = require("./product")(sequelize, Sequelize);
db.Cart = require("./cart")(sequelize, Sequelize);
db.Order = require("./order")(sequelize, Sequelize);
db.OrderItem = require("./orderItem")(sequelize, Sequelize);

// Thiết lập quan hệ giữa các models (nếu cần)
db.User.hasMany(db.Cart, { foreignKey: "userId" });
db.Cart.belongsTo(db.User, { foreignKey: "userId" });

db.Product.hasMany(db.Cart, { foreignKey: "productId" });
db.Cart.belongsTo(db.Product, { foreignKey: "productId" });

db.User.hasMany(db.Order, { foreignKey: "userId" });
db.Order.belongsTo(db.User, { foreignKey: "userId" });

db.Order.hasMany(db.OrderItem, { foreignKey: "orderId" });
db.OrderItem.belongsTo(db.Order, { foreignKey: "orderId" });

db.Product.hasMany(db.OrderItem, { foreignKey: "productId" });
db.OrderItem.belongsTo(db.Product, { foreignKey: "productId" });

module.exports = db;
