const { DataTypes, Model } = require("sequelize");
const sequelize = require("../init.js");

class ListingsModel extends Model {}

ListingsModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "users", key: "id" },
    onDelete: "CASCADE",
  },
  title: { type: DataTypes.STRING, allowNull: false },
  thumb_Resized_image: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  location: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  year: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  PhoneNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  make: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  model: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  Fueltype: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  trim: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  engine: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  drivetrain: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  transmission: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  mileage: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  vin: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  bodyStyle: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  condition: {
    type: DataTypes.ENUM(
      "stock",
      "cosmetic_modifications",
      "light_modification",
      "performance_modifications",
      "heavy_modifications"
    ),
    allowNull: false,
  },
  color: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  exteriorColor: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  interiorColor: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  sellerType: { type: DataTypes.ENUM("dealer", "private"), allowNull: true, defaultValue: null },
  chassisDescription: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  suspensionDescription: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  modificationNotes: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  askingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  fixedPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  reservePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  startingBidPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  currentHighestBid: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  minBidIncrement: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  winningBidId: { type: DataTypes.UUID, allowNull: true, defaultValue: null },
  listingType: {
    type: DataTypes.ENUM("fixed_price", "live_auction"),
    allowNull: false,
    defaultValue: "fixed_price",
  },
  auctionStartTime: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  auctionEndTime: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  biddingDurationSeconds: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 2592000 },
  isSponsored: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sponsoredPlan: { type: DataTypes.ENUM("featured", "advanced"), allowNull: true, defaultValue: null },
  featuredListing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  instagramPromotion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  onlineAdvertisements: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  professionalPhotography: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  status: { type: DataTypes.ENUM("active", "sold", "expired", "pending"), allowNull: false, defaultValue: "active" },
}, {
  sequelize,
  modelName: "ListingsModel",
  tableName: "listings",
  timestamps: true,
  hooks: {
    beforeValidate: (listing) => {
      Object.keys(listing.dataValues).forEach(key => {
        if (typeof listing[key] === "string" && listing[key].trim() === "") listing[key] = null;
      });
    },
  },
});

module.exports = ListingsModel;
