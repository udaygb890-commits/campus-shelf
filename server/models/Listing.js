const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ['Textbooks', 'Electronics', 'Stationery', 'Furniture', 'Notes', 'Other'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    courseCode: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Heavily Used'],
      required: true,
    },
    images: [{ type: String }], // Cloudinary URLs
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    meetupLocations: [{ type: String }], // e.g. ["Library", "Quad"]
    university: {
      type: String,
      trim: true,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Full-text search index
listingSchema.index({ title: 'text', description: 'text', category: 'text', author: 'text' });

module.exports = mongoose.model('Listing', listingSchema);

