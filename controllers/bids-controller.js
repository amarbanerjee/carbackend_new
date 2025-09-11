const { Op } = require('sequelize');
const { BidsModel, ListingsModel, User, AutoBidsModel } = require('../database');
const sequelize = require('../utilities/database');
const { handleAutoBid } = require('../helpers/bidsHelper'); 


// ========== Place a Bid ==========
exports.placeBid = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { listingId } = req.params;
    const { bidAmount, isAutoBid, maxAutoBidAmount, incrementAmount } = req.body;
    const userId = req.userData.userId;

    // Find listing
    const listing = await ListingsModel.findByPk(listingId, { transaction: t });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.listingType !== 'live_auction')
      return res.status(400).json({ message: 'Bidding only allowed on live auction listings' });
    if (listing.userId === userId)
      return res.status(403).json({ message: 'Owner cannot place bid on own listing' });

    // Check auction end time
    if (listing.auctionEndTime && new Date() >= new Date(listing.auctionEndTime)) {
        await ListingsModel.update(
          { status: 'expired' },   
          { where: { id: listing.id }, transaction: t }
        );

        await t.commit(); 
        return res.status(400).json({ message: 'Auction has ended. No more bids allowed.' });
      }


    // ===== Prevent static bids if user has active auto-bid =====
    if (!isAutoBid) {
      const activeAutoBid = await AutoBidsModel.findOne({
        where: { listingId, userId, active: true },
        transaction: t
      });
      if (activeAutoBid) {
        return res.status(400).json({ 
          message: 'You already have an active auto-bid on this listing and cannot place a manual/static bid' 
        });
      }
    }

    // Auto-bid validations
    if (isAutoBid) {
      if (!incrementAmount || parseFloat(incrementAmount) <= 0) {
        return res.status(400).json({
          message: 'Increment amount is required and must be greater than 0 for auto-bid'
        });
      }
      if (!maxAutoBidAmount || parseFloat(maxAutoBidAmount) < parseFloat(bidAmount)) {
        return res.status(400).json({
          message: 'Max auto-bid amount must be greater than or equal to bid amount'
        });
      }

      const existingAutoBid = await AutoBidsModel.findOne({
        where: { listingId, userId, active: true },
        transaction: t
      });
      if (existingAutoBid)
        return res.status(400).json({ message: 'You already have an active auto-bid on this listing' });
    }

    // Get current highest bid
    const highestBid = await BidsModel.findOne({
      where: { listingId },
      order: [['bidAmount', 'DESC']],
      transaction: t
    });
    const currentHighest = highestBid ? parseFloat(highestBid.bidAmount) : parseFloat(listing.askingPrice);

    if (parseFloat(bidAmount) <= currentHighest)
      return res.status(400).json({ message: `Bid must be higher than current highest (${currentHighest})` });

    // Save new bid
    const newBid = await BidsModel.create({ listingId, userId, bidAmount }, { transaction: t });

    // Save auto-bid info
    if (isAutoBid) {
      await AutoBidsModel.upsert({
        listingId,
        userId,
        maxBidAmount: maxAutoBidAmount,
        incrementAmount,
        active: true
      }, { transaction: t });
    }

    await t.commit();

    // Trigger auto-bid war
    await handleAutoBid(listingId);

    return res.status(201).json({ message: 'Bid placed successfully', bid: newBid });

  } catch (error) {
    await t.rollback();
    console.error('placeBid error:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ========== Get Bid History ==========
exports.getBidHistory = async (req, res) => {
  try {
    const { listingId } = req.params;
    let { page, size } = req.query;

    page = parseInt(page) || 1;   // default page = 1
    size = parseInt(size) || 10;  // default size = 10
    const offset = (page - 1) * size;

    const bids = await BidsModel.findAndCountAll({
      where: { listingId },
      include: [
        {
          model: User,
          as: 'bidder',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'emailAddress']
        }
      ],
      order: [['bidAmount', 'DESC']], 
      limit: size,
      offset,
      distinct: true,
    });

   
    const bidsWithSerial = bids.rows.map((bid, index) => ({
      serial: offset + index + 1, 
      ...bid.toJSON()
    }));

    return res.status(200).json({
      pagination: {
        totalItems: bids.count,
        perPage: size,
        currentPage: page,
        lastPage: Math.ceil(bids.count / size),
      },
      bids: bidsWithSerial
    });

  } catch (error) {
    console.error('getBidHistory error:', error);
    return res.status(500).json({ message: error.message });
  }
};




// ========== Get Highest Bid ==========
exports.getHighestBid = async (req, res) => {
  try {
    const { listingId } = req.params;
    const highestBid = await BidsModel.findOne({
      where: { listingId },
      order: [['bidAmount', 'DESC']],
      include: [{ model: User, as: 'bidder', attributes: ['id', 'firstName', 'lastName', 'avatar', 'emailAddress'] }],
    });
    return res.status(200).json({ highestBid });
  } catch (error) {
    console.error('getHighestBid error:', error);
    return res.status(500).json({ message: error.message });
  }
};
