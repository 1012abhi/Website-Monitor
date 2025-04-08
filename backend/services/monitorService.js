const axios = require('axios');
const Website = require('../models/Website');
const CheckHistory = require('../models/CheckHistory');
const nodemailer = require('nodemailer');

class MonitorService {
  constructor() {
    console.log('Initializing monitor service');
    this.createTransporter();
  }

  // Create a new nodemailer transporter
  createTransporter() {
    console.log('Using nodemailer for email alerts');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      // Add these options to fix Gmail authentication issues
      secure: true,
      port: 465,
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
    });
    
    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Nodemailer configuration error:', error);
      } else {
        console.log('Nodemailer server is ready to send messages');
      }
    });
  }
  
  // Refresh the transporter if needed
  refreshTransporter() {
    this.createTransporter();
    console.log('Email transporter has been refreshed');
  }

  async checkWebsite(website) {
    console.log(`Checking website: ${website.name} (${website.url})`);
    try {
      // Ensure URL has a protocol
      let url = website.url;
      if (!url.match(/^https?:\/\//)) {
        url = `https://${url}`;
        console.log(`Added https:// prefix to URL: ${url}`);
      }

      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Website-Monitor/1.0'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Consider only 5xx as errors
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Determine status based on response
      let status = 'unknown';
      if (response.status >= 200 && response.status < 300) {
        status = 'up';
      } else if (response.status >= 400 && response.status < 600) {
        status = 'down';
      }

      console.log(`Website ${website.name} status: ${status}, response time: ${responseTime}ms, status code: ${response.status}`);

      // Save check history
      await CheckHistory.create({
        website: website._id,
        status,
        responseTime,
        statusCode: response.status
      });

      // Update website
      website.lastChecked = new Date();
      website.responseTime = responseTime;
      
      // Update status if different
      if (website.status !== status) {
        console.log(`Status changed from ${website.status} to ${status} for ${website.name}`);
        website.status = status;
        
        // Send alert if website is down
        if (status === 'down' && website.alerts && website.alerts.email) {
          // Ensure owner is populated before sending alert
          if (!website.owner.email) {
            const populatedWebsite = await Website.findById(website._id).populate('owner');
            await this.sendAlert(populatedWebsite, 'Website is down!');
          } else {
            await this.sendAlert(website, 'Website is down!');
          }
        }
      }

      await website.save();

      return {
        status,
        responseTime,
        statusCode: response.status
      };
    } catch (error) {
      console.error(`Error checking website ${website.name}:`, error.message);

      // Determine if this is a connectivity issue or a definite down status
      const status = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ? 'unknown' : 'down';
      
      // Save failed check
      await CheckHistory.create({
        website: website._id,
        status,
        responseTime: null,
        statusCode: 0
      });

      // Update website
      website.lastChecked = new Date();
      website.responseTime = null;
      
      // Only update status if it's different
      if (website.status !== status) {
        console.log(`Status changed from ${website.status} to ${status} for ${website.name}`);
        website.status = status;
        
        // Send alert only if we're confident site is down (not just a timeout)
        if (status === 'down' && website.alerts && website.alerts.email) {
          // Ensure owner is populated before sending alert
          if (!website.owner.email) {
            const populatedWebsite = await Website.findById(website._id).populate('owner');
            await this.sendAlert(populatedWebsite, 'Website is down!');
          } else {
            await this.sendAlert(website, 'Website is down!');
          }
        }
      }

      await website.save();

      return {
        status,
        responseTime: null,
        statusCode: 0
      };
    }
  }

  async sendAlert(website, message) {
    try {
      // Check if we have the owner's email address
      if (!website.owner || !website.owner.email) {
        console.error(`Cannot send alert for ${website.name}: Owner email not available`);
        return;
      }

      // Send email using nodemailer
      try {
        await this.sendEmailWithNodemailer(website, message);
      } catch (emailError) {
        console.error('Error with primary email method:', emailError.message);
        // Try the alternative method if the first one fails
        try {
          await this.sendEmailAlternative(website, message);
        } catch (alternativeError) {
          console.error('Error with alternative email method:', alternativeError.message);
          throw new Error('All email sending methods failed');
        }
      }

      // Send webhook if configured
      if (website.alerts.webhook) {
        console.log(`Sending webhook to ${website.alerts.webhook}`);
        await axios.post(website.alerts.webhook, {
          website: website.name,
          url: website.url,
          message,
          timestamp: new Date().toISOString()
        });
        console.log(`Webhook sent successfully to ${website.alerts.webhook}`);
      }
    } catch (error) {
      console.error('Error sending alert:', error.message);
      if (error.code === 'EAUTH') {
        console.error('Authentication error: Check your EMAIL_USER and EMAIL_PASSWORD environment variables');
      }
    }
  }

  // Helper method to send email using nodemailer
  async sendEmailWithNodemailer(website, message) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4285f4;">Website Monitor Alert</h2>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <p style="font-size: 16px; font-weight: bold;">${message}</p>
          <p><strong>Website:</strong> ${website.name}</p>
          <p><strong>URL:</strong> <a href="${website.url}">${website.url}</a></p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #757575; font-size: 12px; margin-top: 20px;">
          This is an automated alert from Website Monitor
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Website Monitor" <${process.env.EMAIL_USER}>`,
      to: website.owner.email,
      subject: `Website Monitor Alert: ${website.name}`,
      text: `${message}\n\nWebsite: ${website.name}\nURL: ${website.url}\nTime: ${new Date().toISOString()}`,
      html: htmlContent
    };

    console.log(`Sending email alert via nodemailer to ${website.owner.email} for ${website.name}`);
    const info = await this.transporter.sendMail(mailOptions);
    console.log(`Email alert sent successfully to ${website.owner.email}, message ID: ${info.messageId}`);
  }

  // Alternative email sending method using different nodemailer configuration
  async sendEmailAlternative(website, message) {
    // Create a new transporter with OAuth2 or different configuration
    const alternativeTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4285f4;">Website Monitor Alert</h2>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <p style="font-size: 16px; font-weight: bold;">${message}</p>
          <p><strong>Website:</strong> ${website.name}</p>
          <p><strong>URL:</strong> <a href="${website.url}">${website.url}</a></p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #757575; font-size: 12px; margin-top: 20px;">
          This is an automated alert from Website Monitor
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Website Monitor" <${process.env.EMAIL_USER}>`,
      to: website.owner.email,
      subject: `Website Monitor Alert: ${website.name}`,
      text: `${message}\n\nWebsite: ${website.name}\nURL: ${website.url}\nTime: ${new Date().toISOString()}`,
      html: htmlContent
    };

    console.log(`Sending email alert via alternative method to ${website.owner.email} for ${website.name}`);
    const info = await alternativeTransporter.sendMail(mailOptions);
    console.log(`Email alert sent successfully using alternative method, message ID: ${info.messageId}`);
  }

  async calculateUptime(websiteId, period = 24) {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - period);

    const checks = await CheckHistory.find({
      website: websiteId,
      timestamp: { $gte: startTime }
    });

    const totalChecks = checks.length;
    const upChecks = checks.filter(check => check.status === 'up').length;

    return totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;
  }
}

module.exports = new MonitorService(); 