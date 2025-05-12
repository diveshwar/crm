const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Segment = require('../models/Segment');
const Activity = require('../models/Activity');
const { Op } = require('sequelize');
const Customer = require('../models/Customer');
// const authenticateToken = require('../middleware/auth');

// Remove authentication middleware
// router.use(authenticateToken);

// POST /api/segments - Create a new segment
router.post('/', [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('rules').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Save the segment to the database
    const segment = await Segment.create({
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules
    });

    // Create activity log
    await Activity.create({
      userId: req.user?.id || 1,
      action: 'create_segment',
      entityType: 'segment',
      entityId: segment.id,
      message: `Created Segment - ${segment.name}`,
      metadata: {
        rules: segment.rules
      }
    });

    res.status(201).json({ status: 'success', message: 'Segment created!', data: segment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create segment' });
  }
});

// GET /api/segments - List all segments
router.get('/', async (req, res) => {
  try {
    const segments = await Segment.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: 'success', data: { segments } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch segments' });
  }
});

// GET /api/segments/:id - Get a single segment with matching customers
router.get('/:id', async (req, res) => {
  try {
    const segment = await Segment.findByPk(req.params.id);
    if (!segment) {
      return res.status(404).json({ status: 'error', message: 'Segment not found' });
    }

    // Evaluate rules to find matching customers
    let customers = [];
    if (segment.rules && segment.rules.conditions && Array.isArray(segment.rules.conditions)) {
      const conditions = segment.rules.conditions;
      const operator = segment.rules.operator || 'AND';
      // Build Sequelize where clause
      let where = {};
      if (operator === 'AND') {
        for (const cond of conditions) {
          where[cond.field] = cond.value;
        }
      } else if (operator === 'OR') {
        where = {
          [Op.or]: conditions.map(cond => ({ [cond.field]: cond.value }))
        };
      }
      customers = await Customer.findAll({ where });
    }

    res.json({ status: 'success', data: { segment, customers } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch segment' });
  }
});

// PUT /api/segments/:id - Update a segment
router.put('/:id', [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('rules').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const segment = await Segment.findByPk(req.params.id);
    if (!segment) {
      return res.status(404).json({ status: 'error', message: 'Segment not found' });
    }

    // Update the segment
    await segment.update({
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules
    });

    // Create activity log
    await Activity.create({
      userId: req.user?.id || 1,
      action: 'update_segment',
      entityType: 'segment',
      entityId: segment.id,
      message: `Updated Segment - ${segment.name}`,
      metadata: {
        rules: segment.rules
      }
    });

    res.json({ status: 'success', message: 'Segment updated!', data: segment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update segment' });
  }
});

// DELETE /api/segments/:id - Delete a segment
router.delete('/:id', async (req, res) => {
  try {
    const segment = await Segment.findByPk(req.params.id);
    if (!segment) {
      return res.status(404).json({ status: 'error', message: 'Segment not found' });
    }

    // Create activity log before deleting
    await Activity.create({
      userId: req.user?.id || 1,
      action: 'delete_segment',
      entityType: 'segment',
      entityId: segment.id,
      message: `Deleted Segment - ${segment.name}`,
      metadata: {
        rules: segment.rules
      }
    });

    await segment.destroy();
    res.json({ status: 'success', message: 'Segment deleted' });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete segment' });
  }
});

module.exports = router; 