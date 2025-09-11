// CommonJS config file specifically for Sequelize CLI
require('dotenv/config');

module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    migrationStorageTableName: "sequelizeMeta",
    seederStorage: "sequelize",
    seederStorageTableName: "sequelizeData"
  }
};
