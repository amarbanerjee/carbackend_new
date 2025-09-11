const User = require("./models/userModel");
const UserToken = require("./models/userTokenModel");
const ListingsModel = require("./models/listingModel");
const BidsModel = require("./models/bidsModel");
const AutoBidsModel = require("./models/autobidsModel");
const ListingCarGalleryImages = require("./models/listingCarGalleryImageModel");

class DatabaseAssociations {
  static async initializeAssociations() {
    console.log("✅ Initializing Database Associations...");

    User.hasMany(UserToken, { as: "tokens", foreignKey: "userId" });
    UserToken.belongsTo(User, { as: "user", foreignKey: "userId" });

    User.hasMany(ListingsModel, { as: "listings", foreignKey: "userId" });
    ListingsModel.belongsTo(User, { as: "owner", foreignKey: "userId" });

    ListingsModel.hasMany(BidsModel, { as: "bids", foreignKey: "listingId" });
    BidsModel.belongsTo(ListingsModel, { as: "listing", foreignKey: "listingId" });

    User.hasMany(BidsModel, { as: "bids", foreignKey: "userId" });
    BidsModel.belongsTo(User, { as: "bidder", foreignKey: "userId" });

    ListingsModel.hasMany(AutoBidsModel, { as: "autoBids", foreignKey: "listingId" });
    AutoBidsModel.belongsTo(ListingsModel, { as: "listing", foreignKey: "listingId" });

    User.hasMany(AutoBidsModel, { as: "autoBids", foreignKey: "userId" });
    AutoBidsModel.belongsTo(User, { as: "autoBidder", foreignKey: "userId" });

    ListingsModel.hasMany(ListingCarGalleryImages, {
      as: "galleryImages",
      foreignKey: "listingId",
    });
    ListingCarGalleryImages.belongsTo(ListingsModel, {
      as: "listing",
      foreignKey: "listingId",
    });
  }
}

module.exports = DatabaseAssociations;
