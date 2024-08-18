// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: true
  },
  rating: {
    rate: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  qrCode: {
    type: String
  },
  sgst: {  // State Goods and Services Tax
    type: Number,
    default: 0
  },
  cgst: {  // Central Goods and Services Tax
    type: Number,
    default: 0
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
