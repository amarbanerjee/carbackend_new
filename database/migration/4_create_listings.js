'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('listings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      thumb_Resized_image: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      description: { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
      location: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      year: { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
      PhoneNumber: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      make: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      model: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      Fueltype: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      trim: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      engine: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      drivetrain: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      transmission: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      mileage: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      vin: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      bodyStyle: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      condition: { type: Sequelize.ENUM('stock','cosmetic_modifications','light_modification','performance_modifications','heavy_modifications'), allowNull: false },
      color: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      exteriorColor: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      interiorColor: { type: Sequelize.STRING, allowNull: true, defaultValue: null },
      sellerType: { type: Sequelize.ENUM('dealer','private'), allowNull: true, defaultValue: null },
      chassisDescription: { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
      suspensionDescription: { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
      modificationNotes: { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
      askingPrice: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      fixedPrice: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      reservePrice: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      startingBidPrice: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      currentHighestBid: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      minBidIncrement: { type: Sequelize.DECIMAL(12,2), allowNull: true, defaultValue: null },
      winningBidId: { type: Sequelize.UUID, allowNull: true, defaultValue: null },
      listingType: { type: Sequelize.ENUM('fixed_price','live_auction'), allowNull: false, defaultValue: 'fixed_price' },
      auctionStartTime: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
      auctionEndTime: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
      biddingDurationSeconds: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 2592000 },
      isSponsored: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sponsoredPlan: { type: Sequelize.ENUM('featured','advanced'), allowNull: true, defaultValue: null },
      featuredListing: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      instagramPromotion: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      onlineAdvertisements: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      professionalPhotography: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: Sequelize.ENUM('active','sold','expired','pending'), allowNull: false, defaultValue: 'active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('listings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_condition";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_sellerType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_listingType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_sponsoredPlan";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_status";');
  }
};
