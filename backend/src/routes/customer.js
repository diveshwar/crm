const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { publishToQueue } = require('../services/queue');
const Order = require('../models/Order');
// const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               totalSpend:
 *                 type: number
 *               visitCount:
 *                 type: integer
 *               lastVisitDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().notEmpty(),
    body('phone').optional().trim(),
    body('totalSpend').optional().isNumeric(),
    body('visitCount').optional().isInt(),
    body('lastVisitDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Create the customer directly in the database
      const customer = await Customer.create({
        email: req.body.email,
        name: req.body.name,
        country: req.body.country,
        phone: req.body.phone,
        totalSpend: req.body.totalSpend,
        visitCount: req.body.visitCount,
        lastVisitDate: req.body.lastVisitDate
      });

      res.status(201).json({
        status: 'success',
        message: 'Customer created successfully',
        data: { customer }
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating customer'
      });
    }
  }
);

/**
 * @swagger
 * /api/customers/batch:
 *   post:
 *     summary: Create multiple customers
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - email
 *                     - name
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     totalSpend:
 *                       type: number
 *                     visitCount:
 *                       type: integer
 *                     lastVisitDate:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Customers created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/batch',
  [
    body('customers').isArray(),
    body('customers.*.email').isEmail().normalizeEmail(),
    body('customers.*.name').trim().notEmpty(),
    body('customers.*.phone').optional().trim(),
    body('customers.*.totalSpend').optional().isNumeric(),
    body('customers.*.visitCount').optional().isInt(),
    body('customers.*.lastVisitDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Publish to queue for async processing
      await publishToQueue('customer_batch_ingestion', req.body.customers);

      res.status(201).json({
        status: 'success',
        message: 'Customer batch data received for processing'
      });
    } catch (error) {
      console.error('Error processing customer batch data:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error processing customer batch data'
      });
    }
  }
);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers with pagination
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Customer.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        customers: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching customers'
    });
  }
});

// GET /api/customers/:id - Get a single customer with order history
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ status: 'error', message: 'Customer not found' });
    }
    // Get order history
    const orders = await Order.findAll({
      where: { customerId: customer.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ status: 'success', data: { customer, orders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch customer' });
  }
});

/**
 * @swagger
 * /api/customers/:id:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               totalSpend:
 *                 type: number
 *               visitCount:
 *                 type: integer
 *               lastVisitDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid input data
 */
router.put('/:id',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().notEmpty(),
    body('phone').optional().trim(),
    body('totalSpend').optional().isNumeric(),
    body('visitCount').optional().isInt(),
    body('lastVisitDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const customer = await Customer.findByPk(req.params.id);
      if (!customer) {
        return res.status(404).json({ status: 'error', message: 'Customer not found' });
      }

      // Update customer
      await customer.update({
        name: req.body.name,
        email: req.body.email,
        country: req.body.country,
        phone: req.body.phone,
        totalSpend: req.body.totalSpend,
        visitCount: req.body.visitCount,
        lastVisitDate: req.body.lastVisitDate
      });

      res.status(200).json({
        status: 'success',
        message: 'Customer updated successfully',
        data: { customer }
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error updating customer'
      });
    }
  }
);

module.exports = router; 