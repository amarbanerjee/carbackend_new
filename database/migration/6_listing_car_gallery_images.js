'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('listing_car_gallery_images', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.UUIDV4, 
        primaryKey: true 
      },
      listingId: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'listings', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      photo_resized: { 
        type: Sequelize.STRING, 
        allowNull: true 
      },
      createdAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.fn('NOW') 
      },
      updatedAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.fn('NOW') 
      },
    });

    // explicitly name the index
    await queryInterface.addIndex('listing_car_gallery_images', ['listingId'], {
      name: 'idx_listing_car_gallery_images_listingId'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('listing_car_gallery_images');
  }
};
