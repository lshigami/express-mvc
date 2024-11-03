const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const db = {
  sequelize,
  Sequelize,
  User: require('./user')(sequelize),
  Product: require('./product')(sequelize)
};

module.exports = db;