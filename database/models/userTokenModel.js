const { DataTypes, Model } = require("sequelize");
const sequelize = require("../init");
const { Models } = require("../../helpers/constants");

class UserTokenModel extends Model {}

UserTokenModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
  token: { type: DataTypes.TEXT("long"), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
}, {
  sequelize,
  modelName: Models.UserTokenModel,
  tableName: "user_tokens",
  timestamps: true,
});

module.exports = UserTokenModel;
