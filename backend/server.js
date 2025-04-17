const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const socketIo = require('socket.io');
const monitorService = require('./services/monitorService');
const Website = require('./models/Website');

// Load environment variables

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Socket.io configuration with CORS
const io = socketIo(server, {
  cors: corsOptions
});

app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Background monitoring job
const startMonitoringJob = async () => {
  console.log('Starting website monitoring job');
  
  // Run immediately on startup
  await checkAllWebsites();
  
  // Then run periodically
  setInterval(async () => {
    await checkAllWebsites();
  }, 60 * 1000); // Check every minute
};

const checkAllWebsites = async () => {
  try {
    const websites = await Website.find({}).populate('owner');
    console.log(`Checking ${websites.length} websites...`);
    
    for (const website of websites) {
      // Only check if it's time according to the check interval
      const lastChecked = website.lastChecked || new Date(0);
      const timeSinceLastCheck = (new Date() - lastChecked) / (60 * 1000); // in minutes
      
      if (timeSinceLastCheck >= website.checkInterval) {
        try {
          await monitorService.checkWebsite(website);
          
          // Emit status update to connected clients
          io.emit('websiteUpdate', {
            id: website._id,
            status: website.status,
            responseTime: website.responseTime,
            lastChecked: website.lastChecked
          });
        } catch (error) {
          console.error(`Error checking website ${website.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in monitoring job:', error);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/analytics', require('./routes/analytics'));

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startMonitoringJob();
}); 