const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Website = require('../models/Website');
const monitorService = require('../services/monitorService');

// Get all websites for current user
router.get('/', auth, async (req, res) => {
  try {
    const websites = await Website.find({ owner: req.user._id });
    res.json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get website by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Getting website by ID:', req.params.id);
    
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      console.log('Website not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Website not found' });
    }

    console.log('Found website:', website.name);
    res.json(website);
  } catch (error) {
    console.error('Error getting website by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new website
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 }),
  body('url').isURL(),
  body('checkInterval').isInt({ min: 1, max: 60 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, url, checkInterval } = req.body;

    const website = new Website({
      name,
      url,
      checkInterval,
      owner: req.user._id
    });

    await website.save();

    // Perform initial check
    await monitorService.checkWebsite(website);

    res.status(201).json(website);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update website
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1 }),
  body('url').optional().isURL(),
  body('checkInterval').optional().isInt({ min: 1, max: 60 })
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

    const updates = req.body;
    Object.keys(updates).forEach(update => {
      website[update] = updates[update];
    });

    await website.save();
    res.json(website);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete website
router.delete('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.json({ message: 'Website deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get website status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const status = await monitorService.checkWebsite(website);
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alert settings
router.put('/:id/alerts', [
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
    res.json(website);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 