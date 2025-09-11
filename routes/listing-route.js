const express = require('express');
const router = express.Router();

const listingController = require('../controllers/listing-controller.js');
const { authMiddleware } = require('../middlewares/auth-middleware');
const { uploadFields } = require('../helpers/storage-helper');

const fields = [
  { name: 'thumb_Resized_image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 },
];


/**
 * @swagger
 * /listing:
 *   get:
 *     summary: Get all listings
 *     tags:
 *       - Listings
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         description: Keywords to search in listing titles
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by (e.g., createdAt)
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [fixed_price, live_auction]
 *         description: Filter listings by listing type
 *       - in: query
 *         name: make
 *         schema:
 *           type: string
 *         description: Filter by car make
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by car model
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by car manufacturing year
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *         description: Filter by transmission type
 *       - in: query
 *         name: engine
 *         schema:
 *           type: string
 *         description: Filter by engine type
 *       - in: query
 *         name: drivetrain
 *         schema:
 *           type: string
 *         description: Filter by drivetrain (RWD, FWD, AWD, 4WD)
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by car color
 *     responses:
 *       200:
 *         description: A list of listings with pagination info
 */
router.get('/', listingController.getAllListings);


/**
 * @swagger
 * /listing/sponsored:
 *   get:
 *     summary: Get all sponsored listings
 *     tags:
 *       - Listings
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Field to order by (e.g., createdAt)
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: A list of sponsored listings with pagination info
 */
router.get('/sponsored', listingController.getSponsoredListings);

/**
 * @swagger
 * /listing/{listingId}:
 *   get:
 *     summary: Get a listing by ID
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing to retrieve
 *     responses:
 *       200:
 *         description: Listing details
 *       404:
 *         description: Listing not found
 */
router.get('/:listingId', authMiddleware, listingController.getListingById);

/**
 * @swagger
 * /listing/create:
 *   post:
 *     summary: Create a new listing
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - year
 *               - make
 *               - model
 *               - trim
 *               - engine
 *               - Fueltype
 *               - drivetrain
 *               - transmission
 *               - mileage
 *               - vin
 *               - listingType
 *               - PhoneNumber
 *               - isSponsored
 *               - color
 *               - condition
 *             properties:
 *               title:
 *                 type: string
 *                 example: "2015 Tesla Model S"
 *               description:
 *                 type: string
 *                 example: "Electric car in excellent condition."
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               year:
 *                 type: integer
 *                 example: 2015
 *               make:
 *                 type: string
 *                 example: "Tesla"
 *               model:
 *                 type: string
 *                 example: "Model S"
 *               trim:
 *                 type: string
 *                 example: "P90D"
 *               engine:
 *                 type: string
 *                 example: "Electric"
 *               Fueltype:
 *                 type: string
 *                 enum: [petrol, diesel, hybrid, electric]
 *                 example: petrol
 *               drivetrain:
 *                 type: string
 *                 enum: [RWD, FWD, AWD, 4WD]
 *                 example: AWD
 *               transmission:
 *                 type: string
 *                 example: "Automatic"
 *               mileage:
 *                 type: string
 *                 example: "30,000 miles"
 *               vin:
 *                 type: string
 *                 example: "5YJSA1E26FFP12345"
 *               color:
 *                 type: string
 *                 example: "White"
 *               condition:
 *                 type: string
 *                 enum: [stock, cosmetic_modifications, light_modification, performance_modifications, heavy_modifications]
 *                 example: stock
 *               PhoneNumber:
 *                 type: string
 *                 example: "7029159404"
 *               askingPrice:
 *                 type: number
 *                 format: double
 *                 example: 45000.00
 *               fixedPrice:
 *                 type: number
 *                 format: double
 *                 example: 47000.00
 *               listingType:
 *                 type: string
 *                 enum: [fixed_price, live_auction]
 *                 example: "fixed_price"
 *               isSponsored:
 *                 type: boolean
 *                 example: false
  *               frontPage:
 *                 type: boolean
 *                 example: true
 *                 description: "Featured listing (SAR 50)"
 *               instagram:
 *                 type: boolean
 *                 example: false
 *                 description: "Instagram promotion (SAR 50)"
 *               online:
 *                 type: boolean
 *                 example: true
 *                 description: "Online advertisements (SAR 50)"
 *               photography:
 *                 type: boolean
 *                 example: false
 *                 description: "Professional photography (SAR 100)"
 *               thumb_Resized_image:
 *                 type: string
 *                 format: binary
 *                 description: "Thumbnail image file"
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Multiple gallery images"
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', authMiddleware, uploadFields(fields), listingController.saveListing);

/**
 * @swagger
 * /listing/update/{listingId}:
 *   put:
 *     summary: Update an existing listing
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - year
 *               - make
 *               - model
 *               - trim
 *               - engine
 *               - Fueltype
 *               - drivetrain
 *               - transmission
 *               - mileage
 *               - vin
 *               - listingType
 *               - PhoneNumber
 *               - isSponsored
 *               - color
 *               - condition
 *             properties:
 *               title:
 *                 type: string
 *                 example: "2015 Tesla Model S"
 *               description:
 *                 type: string
 *                 example: "Electric car in excellent condition."
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               year:
 *                 type: integer
 *                 example: 2015
 *               make:
 *                 type: string
 *                 example: "Tesla"
 *               model:
 *                 type: string
 *                 example: "Model S"
 *               trim:
 *                 type: string
 *                 example: "P90D"
 *               engine:
 *                 type: string
 *                 example: "Electric"
 *               Fueltype:
 *                 type: string
 *                 enum: [petrol, diesel, hybrid, electric]
 *                 example: petrol
 *               drivetrain:
 *                 type: string
 *                 enum: [RWD, FWD, AWD, 4WD]
 *                 example: AWD
 *               transmission:
 *                 type: string
 *                 example: "Automatic"
 *               mileage:
 *                 type: string
 *                 example: "30,000 miles"
 *               vin:
 *                 type: string
 *                 example: "5YJSA1E26FFP12345"
 *               color:
 *                 type: string
 *                 example: "White"
 *               condition:
 *                 type: string
 *                 enum: [stock, cosmetic_modifications, light_modification, performance_modifications, heavy_modifications]
 *                 example: stock
 *               PhoneNumber:
 *                 type: string
 *                 example: "7029159404"
 *               askingPrice:
 *                 type: number
 *                 format: double
 *                 example: 45000.00
 *               fixedPrice:
 *                 type: number
 *                 format: double
 *                 example: 47000.00
 *               listingType:
 *                 type: string
 *                 enum: [fixed_price, live_auction]
 *                 example: "fixed_price"
 *               isSponsored:
 *                 type: boolean
 *                 example: false
 *               thumb_Resized_image:
 *                 type: string
 *                 format: binary
 *                 description: "Thumbnail image file"
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Multiple gallery images"
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing updated successfully"
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/update/:listingId', authMiddleware, uploadFields(fields), listingController.saveListing);


/**
 * @swagger
 * /listing/{listingId}:
 *   delete:
 *     summary: Delete a listing by ID
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the listing to delete
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing and related images deleted successfully"
 *       404:
 *         description: Listing not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:listingId', authMiddleware, listingController.deleteListing);

module.exports = router;
