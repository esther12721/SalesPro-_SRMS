const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantitySold: {
    type: Number,
    required: [true, 'Quantity sold is required'],
    min: 0,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
