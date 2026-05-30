const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { protect } = require('../middleware/auth');

// GET all sales
router.get('/', protect, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'firstName lastName customerNumber telephone')
      .populate('products.product', 'productName productCode unitPrice')
      .sort({ salesDate: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single sale
router.get('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('products.product');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create sale
router.post('/', protect, async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    const populated = await Sale.findById(sale._id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('products.product', 'productName productCode');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update sale
router.put('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('customer', 'firstName lastName customerNumber')
      .populate('products.product', 'productName productCode');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE sale
router.delete('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
