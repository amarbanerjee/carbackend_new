// database/index.js
const User = require("./models/userModel");
const UserToken = require("./models/userTokenModel");
const ListingsModel = require("./models/listingModel");
const AutoBidsModel = require("./models/autobidsModel");
const BidsModel = require("./models/bidsModel");
const ListingCarGalleryImages = require("./models/listingCarGalleryImageModel");

module.exports = {
  User,
  UserToken,
  ListingsModel,
  BidsModel,
  AutoBidsModel,
  ListingCarGalleryImages
};
