const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const Listing = require('../models/Listing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc  Get all listings (with search, filter, pagination)
// @route GET /api/v1/listings
// @access Public
const getListings = asyncHandler(async (req, res) => {
  const { search, category, condition, minPrice, maxPrice, department, status, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (department) query.department = { $regex: department, $options: 'i' };
  if (status) query.status = status;
  else query.status = 'available';

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Listing.countDocuments(query);
  const listings = await Listing.find(query)
    .populate('seller', 'name avatarUrl rating isVerified university')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: listings,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// @desc  Get single listing by ID
// @route GET /api/v1/listings/:id
// @access Public
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    'seller',
    'name avatarUrl rating isVerified university department'
  );

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Increment view count
  listing.views += 1;
  await listing.save();

  res.json({ success: true, data: listing });
});

// @desc  Create a new listing
// @route POST /api/v1/listings
// @access Private
const createListing = asyncHandler(async (req, res) => {
  const { title, author, isbn, description, category, department, courseCode, price, originalPrice, condition, meetupLocations } = req.body;

  // Handle image uploads (files already uploaded via multer-cloudinary)
  const images = req.files ? req.files.map((f) => f.path) : [];

  const listing = await Listing.create({
    title,
    author,
    isbn,
    description,
    category,
    department,
    courseCode,
    price,
    originalPrice,
    condition,
    images,
    meetupLocations: meetupLocations ? JSON.parse(meetupLocations) : [],
    seller: req.user._id,
    university: req.user.university,
  });

  res.status(201).json({ success: true, data: listing });
});

// @desc  Update a listing
// @route PUT /api/v1/listings/:id
// @access Private (Owner)
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
});

// @desc  Delete a listing
// @route DELETE /api/v1/listings/:id
// @access Private (Owner/Admin)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  await listing.deleteOne();

  res.json({ success: true, message: 'Listing removed' });
});

// @desc  Get current user's listings
// @route GET /api/v1/listings/my
// @access Private
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: listings });
});

module.exports = { getListings, getListing, createListing, updateListing, deleteListing, getMyListings };

