const express = require('express');
const router = express.Router();

const bidController = require('../controllers/bids-controller.js');
const { authMiddleware } = require('../middlewares/auth-middleware');

/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: API endpoints for bidding on listings
 */

/**
 * @swagger
 * /bids/{listingId}:
 *   post:
 *     summary: Place a new bid on a listing
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing to bid on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidAmount
 *             properties:
 *               bidAmount:
 *                 type: number
 *                 example: 55000
 *               incrementAmount:          # <-- NEW FIELD
 *                 type: number
 *                 example: 2000
 *                 description: Difference from the last highest bid (if custom increment is used)
 *               isAutoBid:
 *                 type: boolean
 *                 example: false
 *               maxAutoBidAmount:
 *                 type: number
 *                 example: 70000
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid bid (lower than current or auction closed)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Listing owner cannot bid
 */
router.post('/:listingId', authMiddleware, bidController.placeBid);

/**
 * @swagger
 * /bids/history/{listingId}:
 *   get:
 *     summary: Get all bids for a listing with pagination
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of bids per page (default 10)
 *     responses:
 *       200:
 *         description: Paginated list of bids for this listing
 */
router.get('/history/:listingId', bidController.getBidHistory);


/**
 * @swagger
 * /bids/highest/{listingId}:
 *   get:
 *     summary: Get the highest bid for a listing
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing
 *     responses:
 *       200:
 *         description: Highest bid details
 */
router.get('/highest/:listingId', bidController.getHighestBid);

module.exports = router;
