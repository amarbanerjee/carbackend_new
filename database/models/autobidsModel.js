const { DataTypes, Model } = require("sequelize");
const sequelize = require("../init");
const ListingsModel = require("./listingModel");

class AutoBidsModel extends Model {}

AutoBidsModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listingId: { type: DataTypes.UUID, allowNull: false, references: { model: "listings", key: "id" }, onDelete: "CASCADE" },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
  maxBidAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  incrementAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: 500 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: "AutoBidsModel",
  tableName: "auto_bids",
  timestamps: true,
});

AutoBidsModel.addHook("beforeCreate", async (autoBid) => {
  const listing = await ListingsModel.findByPk(autoBid.listingId);
  if (listing && listing.userId === autoBid.userId) {
    throw new Error("Listing owner cannot set auto-bids on their own listing.");
  }
});

module.exports = AutoBidsModel;
