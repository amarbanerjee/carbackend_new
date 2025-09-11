const { User, UserToken } = require("../database");
const { validateToken } = require('../helpers/auth-helper');
const { HttpStatusCodes, HttpStatusMessages } = require('../helpers/constants');

function formatUnixExpToDate(exp) {
  return new Date(exp * 1000).toISOString();
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
        errorMessage: 'Authorization header missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
        errorMessage: 'Token missing after "Bearer "',
      });
    }

    let decodedToken;
    try {
      decodedToken = await validateToken(token);
    } catch (err) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
        errorMessage: 'Token validation failed',
        details: { error: err.message },
      });
    }

    if (!decodedToken.userId) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
        errorMessage: 'Decoded token does not contain userId',
      });
    }

    // Check token in UserToken table
    const tokenRecord = await UserToken.findOne({
      where: { userId: decodedToken.userId, token },
    });

    if (!tokenRecord) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: 'Token has been expired or revoked',
        errorMessage: 'Token not found in database',
      });
    }

    // Fetch user info
    const user = await User.findByPk(decodedToken.userId, {
      attributes: ['id', 'emailAddress', 'role', 'firstName', 'lastName', 'accountStatus'],
    });

    if (!user) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
        errorMessage: 'User not found',
      });
    }

    // Attach user info to request
    req.userData = {
      userId: user.id,
      emailAddress: user.emailAddress,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      accountStatus: user.accountStatus,
      exp: decodedToken.exp || null,
      expDate: decodedToken.exp ? formatUnixExpToDate(decodedToken.exp) : null,
      fcmToken: decodedToken.fcmToken || null,
      ipAddress: decodedToken.ipAddress || null,
    };

    next();
  } catch (error) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: HttpStatusMessages.UNAUTHORIZED,
      errorMessage: 'Unexpected error in authMiddleware',
      details: { error: error.message || error },
    });
  }
}

module.exports = { authMiddleware };
