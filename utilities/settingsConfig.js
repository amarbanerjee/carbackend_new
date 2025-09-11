class Settings {
  // Core Settings
  static _projectName = process.env.PROJECT_NAME;
  static _appProtocol = process.env.APP_PROTOCOL;
  static _appUrl = process.env.APP_URL;
  static _appPort = process.env.APP_PORT;
  static _appBASEURL = `${Settings._appProtocol}://${Settings._appUrl}:${Settings._appPort}`;
  static _appLiveBASEURL = process.env.APP_LIVE_BASE_URL;

  static _isLambdaEnvironment = process.env.IS_LAMBDA === "true";

  // Encryption Key
  static _encryptionKey = process.env.ENCRYPTION_KEY;

  // Other Settings
  static _isLiveOTP = process.env.IS_LIVE_OTP === "true";
  static _appTimezone = process.env.APP_TIMEZONE;

  // MySQL Database URL for Sequelize
  static _dbUrl = `${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  // SQL logging
 static _sqlLog = console.log;

  static async init() {
    try {
      console.log("Settings have been updated successfully");
    } catch (error) {
      console.log("Unable to create the settings due to: ", error.message);
      throw error;
    }
  }
}

module.exports = Settings;
