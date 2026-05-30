const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Helper: get date range
const getDateRange = (type) => {
  const now = new Date();
  let start;
  if (type === 'daily') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (type === 'weekly') {
    const day = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (type === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end: now };
};

// GET /api/reports/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();
    const revenueAgg = await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmountPaid' } } }]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Today's sales
    const { start: todayStart } = getDateRange('daily');
    const todaySales = await Sale.aggregate([
      { $match: { salesDate: { $gte: todayStart } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmountPaid' } } }
    ]);

    res.json({
      totalCustomers,
      totalProducts,
      totalSales,
      totalRevenue,
      todaySalesCount: todaySales[0]?.count || 0,
      todayRevenue: todaySales[0]?.revenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/:type (daily | weekly | monthly)
router.get('/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const { start, end } = getDateRange(type);

    const sales = await Sale.find({ salesDate: { $gte: start, $lte: end } })
      .populate('customer', 'firstName lastName customerNumber telephone address')
      .populate('products.product', 'productName productCode unitPrice')
      .sort({ salesDate: -1 });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmountPaid, 0);
    const totalTransactions = sales.length;

    // Payment method breakdown
    const paymentBreakdown = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmountPaid;
      return acc;
    }, {});

    // Top products
    const productSales = {};
    sales.forEach(sale => {
      sale.products.forEach(p => {
        const key = p.product?._id?.toString();
        if (key) {
          if (!productSales[key]) {
            productSales[key] = { name: p.product.productName, code: p.product.productCode, qty: 0, revenue: 0 };
          }
          productSales[key].qty += p.quantity;
          productSales[key].revenue += p.quantity * p.unitPrice;
        }
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({
      type,
      period: { start, end },
      totalRevenue,
      totalTransactions,
      paymentBreakdown,
      topProducts,
      sales
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
