const { DataTypes, Model } = require("sequelize");
const sequelize = require("../init");
const { AccountStatus } = require("../../helpers/constants");

class UserModel extends Model {}

UserModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.ENUM("Administrator", "Consumer"), allowNull: false, defaultValue: "Consumer" },
  avatar: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  firstName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  lastName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  emailAddress: { type: DataTypes.STRING, allowNull: false, unique: true },
  emailOTP: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  emailVerifiedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  phoneCountryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  phoneNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  phoneOTP: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  phoneVerifiedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  isOTPVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  providers: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  userSettings: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  accountStatus: { type: DataTypes.ENUM(...Object.values(AccountStatus)), allowNull: false, defaultValue: AccountStatus.ACTIVE },
}, {
  sequelize,
  modelName: "UserModel",
  tableName: "users",
  timestamps: true,
});

module.exports = UserModel;
