const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
// const authenticateToken = require('../middleware/auth');

// Remove authentication middleware
// router.use(authenticateToken);

/**
 * @swagger
 * /api/orders/count:
 *   get:
 *     summary: Get total number of orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Total number of orders
 */
router.get('/count', async (req, res) => {
  try {
    const count = await Order.count();
    res.json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Error fetching order count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order count'
    });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerId, amount, status } = req.body;
    if (!customerId || !amount || !status) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    const order = await Order.create({
      customerId,
      amount,
      status,
      items: [],
      metadata: {}
    });
    res.status(201).json({ status: 'success', data: { order } });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create order' });
  }
});

// PUT /api/orders/:id - Update an order
router.put('/:id', async (req, res) => {
  try {
    const { amount, status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    if (amount !== undefined) order.amount = amount;
    if (status !== undefined) order.status = status;
    await order.save();
    res.json({ status: 'success', data: { order } });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update order' });
  }
});

module.exports = router; 