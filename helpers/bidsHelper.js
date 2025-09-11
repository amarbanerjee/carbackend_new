// ========== Auto-Bid Logic ==========
async function handleAutoBid(listingId) {
  let biddingDone = false;

  while (!biddingDone) {
    biddingDone = true;

    const currentHighest = await BidsModel.findOne({
      where: { listingId },
      order: [['bidAmount', 'DESC']],
    });
    if (!currentHighest) break;

    const opponent = await AutoBidsModel.findOne({
      where: {
        listingId,
        active: true,
        userId: { [Op.ne]: currentHighest.userId },
        maxBidAmount: { [Op.gt]: currentHighest.bidAmount },
      },
      order: [['maxBidAmount', 'DESC']],
    });

    if (opponent) {
      const increment = parseFloat(opponent.incrementAmount);
      const nextBidAmount = parseFloat(currentHighest.bidAmount) + increment;

      if (nextBidAmount <= parseFloat(opponent.maxBidAmount)) {
        await BidsModel.create({
          listingId,
          userId: opponent.userId,
          bidAmount: nextBidAmount,
        });

        // Deactivate auto-bid if max reached
        if (nextBidAmount >= parseFloat(opponent.maxBidAmount)) {
          opponent.active = false;
          await opponent.save();
        }

        biddingDone = false; // Continue for possible counter-bids
      } else {
        // Cannot bid further → deactivate
        opponent.active = false;
        await opponent.save();
      }
    }
  }
}


module.exports = { handleAutoBid };