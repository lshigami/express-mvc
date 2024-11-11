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
    logging: false, // Tắt logging SQL (tùy chọn)
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
// Import các model khác nếu có

// Thiết lập quan hệ giữa các models (nếu cần)
// Ví dụ:
// db.User.hasMany(db.Product);
// db.Product.belongsTo(db.User);

module.exports = db;
