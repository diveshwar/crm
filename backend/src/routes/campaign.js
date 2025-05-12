const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Campaign, CommunicationLog, Customer } = require('../models');
const { publishToQueue } = require('../services/queue');
const { evaluateSegmentRules } = require('../services/segmentEvaluator');
const Activity = require('../models/Activity');
// const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - segmentRules
 *               - messageTemplate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               segmentRules:
 *                 type: object
 *               messageTemplate:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/',
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('segmentRules').isObject(),
    body('messageTemplate').trim().notEmpty(),
    body('scheduledAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Evaluate segment rules to get audience size
      const audienceSize = await evaluateSegmentRules(req.body.segmentRules);

      // Create campaign
      const campaign = await Campaign.create({
        ...req.body,
        status: 'draft'
      });

      // Create activity log
      await Activity.create({
        userId: req.user?.id || 1, // Use authenticated user's ID or default to 1
        action: 'create_campaign',
        entityType: 'campaign',
        entityId: campaign.id,
        message: `Created Campaign - ${campaign.name}`,
        metadata: {
          audienceSize,
          status: campaign.status
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
          campaign,
          audienceSize
        }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error creating campaign'
      });
    }
  }
);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns with pagination
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Campaign.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        campaigns: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching campaigns'
    });
  }
});

/**
 * @swagger
 * /api/campaigns/{id}/stats:
 *   get:
 *     summary: Get campaign statistics
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign statistics
 *       404:
 *         description: Campaign not found
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{
        model: CommunicationLog,
        attributes: ['status']
      }]
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'error',
        message: 'Campaign not found'
      });
    }

    const stats = {
      total: campaign.CommunicationLogs.length,
      sent: campaign.CommunicationLogs.filter(log => log.status === 'sent').length,
      delivered: campaign.CommunicationLogs.filter(log => log.status === 'delivered').length,
      failed: campaign.CommunicationLogs.filter(log => log.status === 'failed').length
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching campaign stats'
    });
  }
});

// GET /api/campaigns/:id - Get a single campaign by ID with stats and message log
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        {
          model: CommunicationLog,
          include: [
            {
              model: Customer,
              attributes: ['id', 'name', 'email', 'country', 'totalSpend', 'visitCount', 'phone']
            }
          ]
        }
      ]
    });
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    // Calculate stats
    const logs = campaign.CommunicationLogs || [];
    const stats = {
      total: logs.length,
      sent: logs.filter(log => log.status === 'sent').length,
      delivered: logs.filter(log => log.status === 'delivered').length,
      failed: logs.filter(log => log.status === 'failed').length,
      pending: logs.filter(log => log.status === 'pending').length
    };

    // Prepare message log
    const messageLog = logs.map(log => ({
      customer: log.Customer ? {
        id: log.Customer.id,
        name: log.Customer.name,
        email: log.Customer.email,
        country: log.Customer.country,
        totalSpend: log.Customer.totalSpend,
        visitCount: log.Customer.visitCount,
        phone: log.Customer.phone
      } : null,
      message: log.message,
      status: log.status,
      timestamp: log.createdAt
    }));

    res.json({
      status: 'success',
      data: {
        campaign,
        stats,
        messageLog
      }
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching campaign' });
  }
});

// DELETE /api/campaigns/:id - Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }
    await campaign.destroy();
    res.json({ status: 'success', message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting campaign' });
  }
});

// PUT /api/campaigns/:id - Update a campaign
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('segmentRules').optional().isObject(),
  body('messageTemplate').optional().trim().notEmpty(),
  body('scheduledAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    // Update campaign
    await campaign.update(req.body);

    // Create activity log
    await Activity.create({
      userId: req.user?.id || 1,
      action: 'update_campaign',
      entityType: 'campaign',
      entityId: campaign.id,
      message: `Updated Campaign - ${campaign.name}`,
      metadata: {
        status: campaign.status
      }
    });

    res.json({ status: 'success', data: { campaign } });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ status: 'error', message: 'Error updating campaign' });
  }
});

module.exports = router; 