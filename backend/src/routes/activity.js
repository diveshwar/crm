const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Customer = require('../models/Customer');

// GET /api/activities - List recent activities
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Activity.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Customer,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      status: 'success',
      data: {
        activities: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching activities'
    });
  }
});

module.exports = router; 