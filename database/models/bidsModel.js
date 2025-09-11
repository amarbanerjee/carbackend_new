const { DataTypes, Model } = require("sequelize");
const sequelize = require("../init");

class BidsModel extends Model {}

BidsModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listingId: { type: DataTypes.UUID, allowNull: false, references: { model: "listings", key: "id" }, onDelete: "CASCADE" },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
  bidAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM("valid", "outbid", "winning", "cancelled"), defaultValue: "valid" },
}, {
  sequelize,
  modelName: "BidsModel",
  tableName: "bids",
  timestamps: true,
  indexes: [{ fields: ["listingId"] }, { fields: ["userId"] }],
});

module.exports = BidsModel;
