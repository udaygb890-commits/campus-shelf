const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');

// @desc  Create a new transaction (make an offer)
// @route POST /api/v1/transactions
// @access Private
const createTransaction = asyncHandler(async (req, res) => {
  const { listingId, offerPrice, meetupLocation, notes } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('This listing is no longer available');
  }
  if (listing.seller.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot make an offer on your own listing');
  }

  const transaction = await Transaction.create({
    listing: listingId,
    buyer: req.user._id,
    seller: listing.seller,
    offerPrice,
    meetupLocation,
    notes,
  });

  // Reserve the listing
  await Listing.findByIdAndUpdate(listingId, { status: 'reserved' });

  await transaction.populate([
    { path: 'listing', select: 'title images price' },
    { path: 'buyer', select: 'name avatarUrl' },
    { path: 'seller', select: 'name avatarUrl' },
  ]);

  res.status(201).json({ success: true, data: transaction });
});

// @desc  Get all transactions for current user (buyer or seller)
// @route GET /api/v1/transactions
// @access Private
const getMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
  })
    .populate('listing', 'title images price')
    .populate('buyer', 'name avatarUrl')
    .populate('seller', 'name avatarUrl')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: transactions });
});

// @desc  Update transaction status (accept, reject, complete, dispute)
// @route PATCH /api/v1/transactions/:id
// @access Private (Seller or Buyer)
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const isSellerAction = ['accepted', 'rejected'].includes(status);
  const isBuyerAction = ['completed', 'disputed'].includes(status);

  if (isSellerAction && transaction.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the seller can accept or reject this offer');
  }
  if (isBuyerAction && transaction.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the buyer can mark as completed or disputed');
  }

  transaction.status = status;
  await transaction.save();

  // If rejected, make listing available again
  if (status === 'rejected') {
    await Listing.findByIdAndUpdate(transaction.listing, { status: 'available' });
  }
  // If completed, mark listing as sold
  if (status === 'completed') {
    await Listing.findByIdAndUpdate(transaction.listing, { status: 'sold' });
  }

  res.json({ success: true, data: transaction });
});

module.exports = { createTransaction, getMyTransactions, updateTransactionStatus };

