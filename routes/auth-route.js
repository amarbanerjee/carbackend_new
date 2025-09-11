const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { body } = require("express-validator");

const authController = require("../controllers/auth-controller");
const validationMiddleware = require("../middlewares/validation-middleware");
const { authMiddleware } = require("../middlewares/auth-middleware"); 
const { User } = require("../database");

const sequelize = require("../utilities/database"); 
const logFilePath = path.join(__dirname, "../logs/access.log");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login with email to receive OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *             example:
 *               emailAddress: "sourav.nayak@ogmaconceptions.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP has been sent successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong while sending mail"
 */
router.post(
  "/login",
  body("emailAddress").isEmail().withMessage("Valid email required"),
  validationMiddleware,
  authController.login
);



/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - otp
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *             example:
 *               emailAddress: "sourav.nayak@ogmaconceptions.com"
 *               otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP has been verified successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isVerified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid OTP or email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or email"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
router.post(
  "/verify-otp",
  body("emailAddress").isEmail(),
  body("otp").notEmpty().withMessage("OTP is required"),
  validationMiddleware,
  authController.verifyOtp
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user info
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OK"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "uuid-of-user"
 *                     emailAddress:
 *                       type: string
 *                       example: "sourav.nayak@ogmaconceptions.com"
 *                     role:
 *                       type: string
 *                       example: "Consumer"
 *                     firstName:
 *                       type: string
 *                       example: "Sourav"
 *                     lastName:
 *                       type: string
 *                       example: "Nayak"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Token not found / user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not found"
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not found"
 */
router.post("/logout", authMiddleware, authController.logout);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete logged-in user account
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

/**
 * @swagger
 * /auth/all-users:
 *   get:
 *     summary: Get all users (no auth for now)
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All users retrieved"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       role:
 *                         type: string
 *                         example: "Consumer"
 *                       avatar:
 *                         type: string
 *                         example: "avatar_url.jpg"
 *                       firstName:
 *                         type: string
 *                         example: "Sourav"
 *                       lastName:
 *                         type: string
 *                         example: "Nayak"
 *                       emailAddress:
 *                         type: string
 *                         format: email
 *                         example: "sourav.nayak@ogmaconceptions.com"
 *                       emailOTP:
 *                         type: string
 *                         example: "123456"
 *                       emailVerifiedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-12T10:00:00.000Z"
 *                       phoneCountryCode:
 *                         type: string
 *                         example: "+91"
 *                       phoneNumber:
 *                         type: string
 *                         example: "9876543210"
 *                       phoneOTP:
 *                         type: string
 *                         example: "654321"
 *                       phoneVerifiedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-12T10:00:00.000Z"
 *                       isOTPVerified:
 *                         type: boolean
 *                         example: true
 *                       providers:
 *                         type: array
 *                         items:
 *                           type: object
 *                         example: []
 *                       authTokens:
 *                         type: array
 *                         items:
 *                           type: object
 *                         example: []
 *                       userSettings:
 *                         type: object
 *                         example: {}
 *                       accountStatus:
 *                         type: string
 *                         example: "ACTIVE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-01T09:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-12T10:00:00.000Z"
 *       500:
 *         description: Failed to fetch users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch users"
 *                 errorMessage:
 *                   type: string
 *                   example: "Database error details"
 */



router.get('/all-users', async (req, res) => {
  try {
    const users = await User.findAll(); // all fields included by default

    return res.status(200).json({
      message: 'All users retrieved',
      users,
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({
      message: 'Failed to fetch users',
      errorMessage: error.message || 'Unknown error',
    });
  }
})


/**
 * @swagger
 * /auth/access-log:
 *   get:
 *     summary: Get all access logs
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: List of all access logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access logs retrieved successfully"
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/access-log", (req, res) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return res.status(200).json({ message: "No logs found", logs: [] });
    }

    const fileContent = fs.readFileSync(logFilePath, "utf8");
    const logs = fileContent
      .split("\n")
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          // If line is not JSON (Morgan format), return raw line
          return { raw: line };
        }
      });

    return res.status(200).json({
      message: "Access logs retrieved successfully",
      logs,
    });
  } catch (error) {
    console.error("Failed to read access logs:", error);
    return res.status(500).json({
      message: "Failed to retrieve access logs",
      errorMessage: error.message || "Unknown error",
    });
  }
});


/**
 * @swagger
 * /auth/table-info:
 *   get:
 *     summary: Get database schema with all tables and columns
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Database schema retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database schema retrieved successfully"
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "VARCHAR(255)"
 *                         allowNull:
 *                           type: boolean
 *                           example: false
 *                         defaultValue:
 *                           type: string
 *                           example: null
 *                         primaryKey:
 *                           type: boolean
 *                           example: true
 *                         autoIncrement:
 *                           type: boolean
 *                           example: false
 *                   example:
 *                     users:
 *                       id:
 *                         type: "CHAR(36)"
 *                         allowNull: false
 *                         defaultValue: null
 *                         primaryKey: true
 *                         autoIncrement: false
 *                       emailAddress:
 *                         type: "VARCHAR(255)"
 *                         allowNull: false
 *                         defaultValue: null
 *                         primaryKey: false
 *                         autoIncrement: false
 *                     posts:
 *                       id:
 *                         type: "INT"
 *                         allowNull: false
 *                         defaultValue: null
 *                         primaryKey: true
 *                         autoIncrement: true
 *                       title:
 *                         type: "VARCHAR(255)"
 *                         allowNull: false
 *                         defaultValue: null
 *                         primaryKey: false
 *                         autoIncrement: false
 */
router.get("/table-info", async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables(); // get all tables
    const dbInfo = {};

    for (const table of tables) {
      const tableDesc = await queryInterface.describeTable(table);
      dbInfo[table] = tableDesc; // column info with types from DB
    }

    return res.status(200).json({
      message: "Database schema retrieved successfully",
      data: dbInfo,
    });
  } catch (error) {
    console.error("Failed to fetch table info:", error);
    return res.status(500).json({
      message: "Failed to fetch database schema",
      error: error.message,
    });
  }
});



module.exports = router;
