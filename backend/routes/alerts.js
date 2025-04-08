const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Website = require('../models/Website');
const monitorService = require('../services/monitorService');
const { body, validationResult } = require('express-validator');

// Get alert settings for a website
router.get('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.json(website.alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alert settings
router.put('/:id', [
  auth,
  body('email').optional().isBoolean(),
  body('webhook').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    if (req.body.email !== undefined) {
      website.alerts.email = req.body.email;
    }

    if (req.body.webhook) {
      website.alerts.webhook = req.body.webhook;
    }

    await website.save();
    res.json(website.alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test alert
router.post('/:id/test', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('owner');

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    await monitorService.sendAlert(website, 'This is a test alert from Website Monitor');

    res.json({ message: 'Test alert sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 