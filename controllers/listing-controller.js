const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('../utilities/database');
const Settings = require('../utilities/settingsConfig');
const { ListingsModel, ListingCarGalleryImages } = require('../database');

 const liveBaseUrl = Settings._appLiveBASEURL; 


function buildFullUrl(filePath) {
  if (!filePath) return null;
  // Convert Windows backslashes to forward slashes for URL test
  const normalizedPath = filePath.replace(/\\/g, '/');
  return `${liveBaseUrl}/${normalizedPath}`;
}

exports.getListingById = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    const listing = await ListingsModel.findOne({
      where: { id: listingId },
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Build full URL for thumb image
    const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

    // Build full URLs for gallery images
    const galleryImages = listing.galleryImages.map(img => ({
      id: img.id,
      photoResized: buildFullUrl(img.photoResized),
    }));

    res.status(200).json({
      listing: {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      },
    });
  } catch (error) {
    console.error('getListingById error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSponsoredListings = async (req, res) => {
  try {
    let { page, size, orderBy, orderType } = req.query;

    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    const listings = await ListingsModel.findAndCountAll({
      where: { isSponsored: true },
      distinct: true,
      limit: size,
      offset,
      order: [[orderBy || 'createdAt', orderType?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    const listingsWithUrls = listings.rows.map(listing => {
      const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

      const galleryImages = listing.galleryImages.map(img => ({
        id: img.id,
        photoResized: buildFullUrl(img.photoResized),
      }));

      return {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      };
    });

    res.status(200).json({
      pagination: {
        totalItems: listings.count,
        perPage: size,
        currentPage: page,
        lastPage: Math.ceil(listings.count / size),
      },
      listings: listingsWithUrls,
    });
  } catch (error) {
    console.error('getSponsoredListings error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    let {
      page,
      size,
      keywords,
      orderBy,
      orderType,
      listingType,
      make,
      model,
      year,
      location,
      transmission,
      engine,
      drivetrain,
      color
    } = req.query;

    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const offset = (page - 1) * size;

    const whereClause = {};

    // Keywords search
    if (keywords) {
      whereClause.title = { [Op.like]: `%${keywords}%` };
    }

    // Listing type filter
    const validListingTypes = ['fixed_price', 'live_auction'];
    if (listingType && validListingTypes.includes(listingType)) {
      whereClause.listingType = listingType;
    }

    // Additional filters
    if (make) whereClause.make = make;
    if (model) whereClause.model = model;
    if (year) whereClause.year = parseInt(year);
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (transmission) whereClause.transmission = transmission;
    if (engine) whereClause.engine = engine;
    if (drivetrain) whereClause.drivetrain = drivetrain;
    if (color) whereClause.color = color;

    const listings = await ListingsModel.findAndCountAll({
      where: whereClause,
      distinct: true,
      limit: size,
      offset,
      order: [[orderBy || 'createdAt', orderType?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    // Map listings to add full URLs for images
    const listingsWithUrls = listings.rows.map(listing => {
      const thumbUrl = buildFullUrl(listing.thumb_Resized_image);

      const galleryImages = listing.galleryImages.map(img => ({
        id: img.id,
        photoResized: buildFullUrl(img.photoResized),
      }));

      return {
        ...listing.toJSON(),
        thumb_Resized_image: thumbUrl,
        galleryImages,
      };
    });

    res.status(200).json({
      pagination: {
        totalItems: listings.count,
        perPage: size,
        currentPage: page,
        lastPage: Math.ceil(listings.count / size),
      },
      listings: listingsWithUrls,
    });
  } catch (error) {
    console.error('getAllListings error:', error);
    res.status(500).json({ message: error.message });
  }
};



function sanitize(value) {
  if (value === undefined || value === null || value === '') return null;
  return value;
}

function normalizeBoolean(value) {
  if (value === true || value === "true") return true;
  return false; // covers false, "false", null, undefined, ""
}

exports.saveListing = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    let listing = null;

    const {
      title,
      description,
      location,
      year,
      make,
      model,
      trim,
      engine,
      Fueltype,
      color,
      condition,
      drivetrain,
      transmission,
      mileage,
      vin,
      isSponsored,
      listingType,
      askingPrice,
      fixedPrice,

      frontPage,
      instagram,
      online,
      photography,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title, description, location, year, make, model, trim, engine, Fueltype, drivetrain,
      transmission, mileage, vin, color, condition, listingType
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === '') {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    if (listingId) {
      listing = await ListingsModel.findOne({ where: { id: listingId } });
      if (!listing) return res.status(404).json({ message: 'Listing not found' });
    }

    const transaction = await sequelize.transaction();

    try {
      // Set auctionEndTime only for live auctions
      let auctionEndTime = null;
      if (listingType === 'live_auction') {
        auctionEndTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }

      const listingData = {
        userId: req.userData.userId,
        title, description, location, year, make, model, trim, engine, Fueltype,
        drivetrain, transmission, mileage, vin, color, condition, listingType,
        auctionEndTime,
        askingPrice: sanitize(askingPrice),
        fixedPrice: sanitize(fixedPrice),
        isSponsored: sanitize(isSponsored),
        status: 'active',
      featuredListing: normalizeBoolean(frontPage),
      instagramPromotion: normalizeBoolean(instagram),
      onlineAdvertisements: normalizeBoolean(online),
      professionalPhotography: normalizeBoolean(photography),

      };

      // Handle thumbnail image
      if (req.files?.thumb_Resized_image?.[0]) {
        if (listing?.thumb_Resized_image) {
          const oldThumbPath = path.join(__dirname, '..', 'public', listing.thumb_Resized_image);
          if (fs.existsSync(oldThumbPath)) fs.unlinkSync(oldThumbPath);
        }

        const file = req.files.thumb_Resized_image[0];
        const ext = path.extname(file.originalname);
        let newFilename = file.filename;
        if (!newFilename.endsWith(ext)) {
          const oldPath = file.path;
          newFilename += ext;
          const newPath = path.join(path.dirname(oldPath), newFilename);
          fs.renameSync(oldPath, newPath);
          file.path = newPath;
        }
        listingData.thumb_Resized_image = path.join('uploads', newFilename);
      }

      // Create or update listing
      if (listingId) {
        await ListingsModel.update(listingData, { where: { id: listingId }, transaction });
      } else {
        listing = await ListingsModel.create(listingData, { transaction });
      }

      const currentListingId = listingId || listing.id;

      // Handle gallery images
      if (req.files?.galleryImages?.length > 0) {
        if (listingId) {
          const oldGalleryImages = await ListingCarGalleryImages.findAll({ where: { listingId: currentListingId } });
          for (const img of oldGalleryImages) {
            if (img.photoResized) {
              const oldGalleryPath = path.join(__dirname, '..', 'public', img.photoResized);
              if (fs.existsSync(oldGalleryPath)) fs.unlinkSync(oldGalleryPath);
            }
          }
          await ListingCarGalleryImages.destroy({ where: { listingId: currentListingId }, transaction });
        }

        const imagesToCreate = [];
        for (const file of req.files.galleryImages) {
          const ext = path.extname(file.originalname);
          let newFilename = file.filename;
          if (!newFilename.endsWith(ext)) {
            const oldPath = file.path;
            newFilename += ext;
            const newPath = path.join(path.dirname(oldPath), newFilename);
            fs.renameSync(oldPath, newPath);
            file.path = newPath;
          }
          imagesToCreate.push({ listingId: currentListingId, photoResized: path.join('uploads', newFilename) });
        }
        await ListingCarGalleryImages.bulkCreate(imagesToCreate, { transaction });
      }

      // Delete specific gallery images if requested
      if (req.body.deletedImageIds?.length > 0) {
        const imagesToDelete = await ListingCarGalleryImages.findAll({
          where: { id: req.body.deletedImageIds, listingId: currentListingId },
        });
        for (const img of imagesToDelete) {
          if (img.photoResized) {
            const delGalleryPath = path.join(__dirname, '..', 'public', img.photoResized);
            if (fs.existsSync(delGalleryPath)) fs.unlinkSync(delGalleryPath);
          }
        }
        await ListingCarGalleryImages.destroy({
          where: { id: req.body.deletedImageIds, listingId: currentListingId },
          transaction,
        });
      }

      await transaction.commit();

      return res.status(listingId ? 200 : 201).json({
        message: listingId ? 'Listing updated successfully' : 'Listing created successfully',
        listingId: currentListingId,
      });

    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: error.message });
    }

  } catch (error) {
    console.error('saveListing controller error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  const listingId = req.params.listingId;

  try {
    const listing = await ListingsModel.findOne({
      where: { id: listingId },
      include: [
        {
          model: ListingCarGalleryImages,
          as: 'galleryImages',
          attributes: ['id', 'photoResized'],
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Delete gallery images files
      for (const img of listing.galleryImages) {
        if (img.photoResized) {
          const imgPath = path.join(__dirname, '..', 'public', img.photoResized);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }
      }

      // Delete thumbnail file
      if (listing.thumb_Resized_image) {
        const thumbPath = path.join(__dirname, '..', 'public', listing.thumb_Resized_image);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }

      // Delete gallery image DB records
      await ListingCarGalleryImages.destroy({
        where: { listingId },
        transaction,
      });

      // Delete listing record
      await ListingsModel.destroy({
        where: { id: listingId },
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({ message: 'Listing and related images deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting listing:', error);
      return res.status(500).json({ message: 'Failed to delete listing' });
    }
  } catch (error) {
    console.error('deleteListing controller error:', error);
    return res.status(500).json({ message: error.message });
  }
};

