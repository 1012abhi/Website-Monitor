const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Website = require('../models/Website');
const CheckHistory = require('../models/CheckHistory');
const monitorService = require('../services/monitorService');

// Get website uptime
router.get('/:id/uptime', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const period = parseInt(req.query.period) || 24; // Default to 24 hours
    const uptime = await monitorService.calculateUptime(website._id, period);

    res.json({ uptime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get response time history
router.get('/:id/response-time', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const period = parseInt(req.query.period) || 24; // Default to 24 hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - period);

    const history = await CheckHistory.find({
      website: website._id,
      timestamp: { $gte: startTime },
      responseTime: { $ne: null }
    })
    .sort({ timestamp: 1 })
    .select('timestamp responseTime -_id');

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get status history
router.get('/:id/status-history', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const period = parseInt(req.query.period) || 24; // Default to 24 hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - period);

    const history = await CheckHistory.find({
      website: website._id,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: 1 })
    .select('timestamp status statusCode -_id');

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get downtime incidents
router.get('/:id/downtime', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const period = parseInt(req.query.period) || 24; // Default to 24 hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - period);

    const incidents = await CheckHistory.find({
      website: website._id,
      timestamp: { $gte: startTime },
      status: 'down'
    })
    .sort({ timestamp: 1 })
    .select('timestamp statusCode -_id');

    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get response time history for all websites
router.get('/response-time', auth, async (req, res) => {
  try {
    console.log('Getting response time data for all websites');
    
    // Get all websites owned by the user
    const websites = await Website.find({
      owner: req.user._id
    });

    if (!websites || websites.length === 0) {
      console.log('No websites found for user');
      return res.json([]);
    }

    const websiteIds = websites.map(website => website._id);
    
    const period = parseInt(req.query.period) || 24; // Default to 24 hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - period);
    
    // Get response time data for all websites
    const history = await CheckHistory.find({
      website: { $in: websiteIds },
      timestamp: { $gte: startTime },
      responseTime: { $ne: null }
    })
    .sort({ timestamp: 1 })
    .limit(100) // Limit to prevent excessive data
    .select('timestamp responseTime -_id');

    console.log(`Found ${history.length} response time entries`);
    res.json(history);
  } catch (error) {
    console.error('Error getting response time:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 