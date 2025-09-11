'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      role: { type: Sequelize.ENUM('Administrator', 'Consumer'), allowNull: false, defaultValue: 'Consumer' },
      avatar: Sequelize.STRING,
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      emailAddress: { type: Sequelize.STRING, allowNull: false, unique: true },
      emailOTP: Sequelize.STRING,
      emailVerifiedAt: Sequelize.DATE,
      phoneCountryCode: Sequelize.STRING,
      phoneNumber: Sequelize.STRING,
      phoneOTP: Sequelize.STRING,
      phoneVerifiedAt: Sequelize.DATE,
      isOTPVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      providers: { type: Sequelize.JSON, defaultValue: [] },
      userSettings: { type: Sequelize.JSON, defaultValue: {} },
      accountStatus: { type: Sequelize.ENUM('PENDING', 'ACTIVE', 'SUSPENDED'), defaultValue: 'ACTIVE' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_accountStatus";');
  }
};
