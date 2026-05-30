const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  salesDate: {
    type: Date,
    required: [true, 'Sales date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card', 'Cheque']
  },
  totalAmountPaid: {
    type: Number,
    required: [true, 'Total amount paid is required'],
    min: 0
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      unitPrice: {
        type: Number,
        required: true
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
