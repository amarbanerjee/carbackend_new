const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const AppSettings = require("../utilities/settingsConfig");
const { AccountStatus, HttpStatusCodes } = require("./constants");
const moment = require("./timezoneHelper");
const { User, UserToken } = require("../database");


function getUserDetails(user) {
  return {
    userId: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    phoneCountryCode: user.phoneCountryCode,
    phoneNumber: user.phoneNumber,
    emailVerifiedAt: user.emailVerifiedAt,
    phoneVerifiedAt: user.phoneVerifiedAt,
    registeredAt: user.createdAt,
  };
}

function validateToken(token) {
  try {
    return jwt.verify(token, AppSettings._encryptionKey);
  } catch (error) {
    console.error("Token validation failed:", error.message);
    throw new Error("Invalid token: " + error.message);
  }
}

async function getUser({ emailAddress }) {
  return await User.findOne({
    where: { emailAddress },
    attributes: [
      "id",
      ["id", "userId"],
      "firstName",
      "lastName",
      "emailAddress",
      "role",
      "password",
    ],
    raw: true,
  });
}

async function generateToken({ userData, ipAddress = null }) {
  try {
    const expiresInSeconds = 15 * 24 * 60 * 60; // 15 days

    const token = jwt.sign(userData, AppSettings._encryptionKey, { expiresIn: expiresInSeconds });
    if (!token) throw new Error("Token generation failed");

    // Save token in UserToken table instead of User.authTokens
    await UserToken.create({
      userId: userData.userId,
      token,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });

    return token;
  } catch (err) {
    console.error("generateToken error:", err);
    throw err;
  }
}




async function destroyToken({ userId, token }) {
  await UserToken.destroy({
    where: { userId, token }
  });
}


async function updateEmailOtpInDatabase({ emailAddress, emailOtp }) {
  return await User.update(
    { emailOTP: emailOtp },
    { where: { emailAddress } }
  );
}

async function findUserInDatabase(emailAddress) {
  const user = await User.findOne({ where: { emailAddress }, raw: true });
  if (!user) {
    const error = new Error("User Not Found!");
    error.statusCode = HttpStatusCodes.NOT_FOUND;
    throw error;
  }
  return user;
}

async function createUserInDatabase({ userData, emailOtp }) {
  return await User.create({
    ...userData,
    emailOTP: emailOtp,
    role: "Consumer",
    accountStatus: AccountStatus.ACTIVE,
    emailVerifiedAt: moment(),
  });
}

async function verifyUserOtp({ emailAddress, otp }) {
  const user = await User.findOne({ where: { emailAddress } });
  if (!user) {
    const error = new Error("User Not Found!");
    error.statusCode = HttpStatusCodes.NOT_FOUND;
    throw error;
  }

  if (user.emailOTP !== otp) {
    const error = new Error("Invalid OTP!");
    error.statusCode = HttpStatusCodes.BAD_REQUEST;
    throw error;
  }

  await user.update({ emailOTP: null, isOTPVerified: true });
  return user;
}

async function validateUserProvider(providerType, providerId) {
  return await User.findOne({
    where: {
      providers: {
        [Op.contains]: [{ providerType, providerId }],
      },
    },
  });
}

async function registerSSOUser(providerType, providerId, firstName, lastName, emailAddress) {
  if (await validateUserProvider(providerType, providerId)) {
    return false; // User already registered with this provider
  }

  const existingUser = await User.findOne({
    where: { emailAddress, role: "Consumer" },
  });

  if (existingUser) {
    const providers = existingUser.providers || [];
    if (providers.some((p) => p.providerType === providerType && p.providerId === providerId)) {
      return false;
    }

    providers.push({ providerType, providerId });
    await existingUser.update({ providers });
    return existingUser;
  }

  return await User.create({
    role: "Consumer",
    firstName,
    lastName,
    emailAddress,
    emailVerifiedAt: moment(),
    accountStatus: AccountStatus.ACTIVE,
    providers: [{ providerType, providerId }],
  });
}

async function authenticateSSOUser(providerType, providerId) {
  return await validateUserProvider(providerType, providerId);
}

async function deleteUserAccount(userId) {
  return await User.destroy({ where: { id: userId } });
}

module.exports = {
  getUser,
  validateToken,
  getUserDetails,
  generateToken,
  destroyToken,
  updateEmailOtpInDatabase,
  findUserInDatabase,
  createUserInDatabase,
  verifyUserOtp,
  validateUserProvider,
  registerSSOUser,
  authenticateSSOUser,
  deleteUserAccount,
};