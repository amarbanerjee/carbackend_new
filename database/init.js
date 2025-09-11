const { Sequelize } = require("sequelize");
const AppSettings = require("../utilities/settingsConfig");
require("dotenv").config();

const sequelize = new Sequelize(AppSettings._dbUrl, {
  dialect: "mysql", // important for MySQL
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: AppSettings._sqlLog,
});

module.exports = sequelize;
