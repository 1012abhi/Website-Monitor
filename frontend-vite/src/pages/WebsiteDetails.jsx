import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import config from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WebsiteDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [responseTimeData, setResponseTimeData] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [downtimeIncidents, setDowntimeIncidents] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    emailAlerts: false,
    webhookUrl: ''
  });
  const [alertError, setAlertError] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');
  const [testAlertLoading, setTestAlertLoading] = useState(false);

  useEffect(() => {
    // Set the active tab based on URL hash, if present
    const hash = location.hash;
    if (hash === '#performance') {
      setActiveTab(0);
    } else if (hash === '#alerts') {
      setActiveTab(1);
    } else if (hash === '#history') {
      setActiveTab(2);
    }
  }, [location]);

  useEffect(() => {
    fetchWebsiteDetails();
  }, [id]);

  const fetchWebsiteDetails = async () => {
    try {
      console.log('Fetching details for website ID:', id);
      
      if (!id) {
        setError('Invalid website ID');
        setLoading(false);
        return;
      }
      
      // First try to get the website data with owner information
      const websiteRes = await axios.get(`${config.API_URL}/websites/${id}?includeOwner=true`);
      
      if (!websiteRes.data) {
        setError('Website not found');
        setLoading(false);
        return;
      }
      
      console.log('Website data received:', websiteRes.data);
      setWebsite(websiteRes.data);
      
      // Then get analytics data
      const [responseTimeRes, statusHistoryRes, downtimeRes] = await Promise.all([
        axios.get(`${config.API_URL}/analytics/${id}/response-time`),
        axios.get(`${config.API_URL}/analytics/${id}/status-history`),
        axios.get(`${config.API_URL}/analytics/${id}/downtime`)
      ]);

      // Prepare response time data for chart
      const responseTimeHistory = responseTimeRes.data;
      setResponseTimeData({
        labels: responseTimeHistory.map(item => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: 'Response Time (ms)',
            data: responseTimeHistory.map(item => item.responseTime),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      });

      setStatusHistory(statusHistoryRes.data);
      setDowntimeIncidents(downtimeRes.data);
    } catch (err) {
      console.error('Error fetching website details:', err);
      setError('Failed to fetch website details: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL hash when tab changes
    const tabHashes = ['#performance', '#alerts', '#history'];
    window.history.replaceState(null, null, `${location.pathname}${tabHashes[newValue]}`);
  };

  const handleAlertToggle = async () => {
    try {
      setAlertError('');
      setAlertSuccess('');
      
      // Toggle the email alerts setting
      const newEmailSetting = !(website.alerts?.email || false);
      
      // Update local state immediately for responsive UI
      setWebsite({
        ...website,
        alerts: {
          ...website.alerts,
          email: newEmailSetting
        }
      });
      
      // Send update to server
      const response = await axios.put(`${config.API_URL}/alerts/${id}`, {
        email: newEmailSetting
      });
      
      console.log('Alert toggle response:', response);
      setAlertSuccess(`Email alerts ${newEmailSetting ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Alert toggle error:', error);
      
      // Revert the local state change on error
      setWebsite({
        ...website,
        alerts: {
          ...website.alerts,
          email: !(website.alerts?.email || false)
        }
      });
      
      setAlertError('Failed to update alert settings: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleWebhookChange = async (webhookUrl) => {
    try {
      setAlertError('');
      setAlertSuccess('');
      
      // Use the correct alerts endpoint
      await axios.put(`${config.API_URL}/alerts/${id}`, {
        webhook: webhookUrl
      });
      
      // Update the local state with the new webhook URL
      setWebsite({
        ...website,
        alerts: {
          ...website.alerts,
          webhook: webhookUrl
        }
      });
      
      setAlertSuccess('Webhook URL updated successfully');
    } catch (error) {
      console.error('Webhook update error:', error);
      setAlertError('Failed to update webhook URL: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTestAlert = async () => {
    try {
      // Check if email alerts are enabled
      if (!website.alerts?.email) {
        setAlertError('Email alerts are not enabled. Please enable email alerts first.');
        return;
      }
      
      setAlertError('');
      setAlertSuccess('');
      setTestAlertLoading(true);
      
      // Use the correct endpoint from the backend routes
      const response = await axios.post(`${config.API_URL}/alerts/${id}/test`);
      
      console.log('Test alert response:', response);
      setAlertSuccess('Test alert sent successfully! Please check your email inbox.');
    } catch (error) {
      console.error('Test alert error:', error);
      setAlertError('Failed to send test alert: ' + (error.response?.data?.message || error.message));
    } finally {
      setTestAlertLoading(false);
    }
  };

  const handleFirebaseTestAlert = async () => {
    try {
      // Check if email alerts are enabled
      if (!website.alerts?.email) {
        setAlertError('Email alerts are not enabled. Please enable email alerts first.');
        return;
      }
      
      setAlertError('');
      setAlertSuccess('');
      setTestAlertLoading(true);
      
      // Use the Firebase-specific test endpoint
      const response = await axios.post(`${config.API_URL}/alerts/${id}/test-firebase`);
      
      console.log('Firebase test alert response:', response.data);
      setAlertSuccess('Firebase email alert queued successfully! Please check your email inbox.');
    } catch (error) {
      console.error('Firebase test alert error:', error);
      setAlertError('Failed to send Firebase test alert: ' + (error.response?.data?.error || error.message));
    } finally {
      setTestAlertLoading(false);
    }
  };

  if (!website) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Website not found or data could not be loaded.
        </Alert>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {website.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        <a href={website.url} target="_blank" rel="noopener noreferrer">{website.url}</a>
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Status
              </Typography>
              <Typography
                variant="h4"
                color={
                  website.status === 'up'
                    ? 'success.main'
                    : website.status === 'down'
                    ? 'error.main'
                    : 'warning.main'
                }
              >
                {website.status ? website.status.toUpperCase() : 'UNKNOWN'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Response Time
              </Typography>
              <Typography variant="h4">
                {website.responseTime ? `${website.responseTime}ms` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Uptime (24h)
              </Typography>
              <Typography variant="h4">
                {website.uptime ? `${website.uptime.toFixed(2)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last Checked
              </Typography>
              <Typography variant="h6">
                {website.lastChecked ? new Date(website.lastChecked).toLocaleString() : 'Not checked yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Performance" />
        <Tab label="Alerts" />
        <Tab label="History" />
      </Tabs>

      {activeTab === 0 && responseTimeData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Response Time Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={responseTimeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Response Time (ms)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alert Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Email Notifications</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Receive email alerts when website status changes</Typography>
                    <Switch
                      checked={website.alerts?.email || false}
                      onChange={handleAlertToggle}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                    {website.alerts?.email 
                      ? `Email alerts are enabled. You will receive notifications at: ${website.owner?.email || 'your registered email'}`
                      : 'Email alerts are currently disabled. Toggle the switch to enable.'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography>Webhook URL</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={website.alerts?.webhook || ''}
                    onChange={(e) => setWebsite({
                      ...website,
                      alerts: {
                        ...website.alerts,
                        webhook: e.target.value
                      }
                    })}
                    placeholder="https://your-webhook-url.com"
                    helperText="Enter a webhook URL to receive alerts"
                  />
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => handleWebhookChange(website.alerts?.webhook || '')}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Save Webhook URL
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle1">Test Email Notifications</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleTestAlert}
                      disabled={testAlertLoading || !website.alerts?.email}
                      startIcon={testAlertLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {testAlertLoading ? 'Sending...' : 'Send Test Email (Nodemailer)'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleFirebaseTestAlert}
                      disabled={testAlertLoading || !website.alerts?.email}
                      startIcon={testAlertLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {testAlertLoading ? 'Sending...' : 'Send Test Email (Firebase)'}
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {website.alerts?.email
                      ? 'Send a test email to verify your notification settings are working correctly.'
                      : 'Enable email alerts above to send test notifications.'}
                  </Typography>
                </Box>
              </Grid>
              {alertSuccess && (
                <Grid item xs={12}>
                  <Alert severity="success" onClose={() => setAlertSuccess('')}>
                    {alertSuccess}
                  </Alert>
                </Grid>
              )}
              {alertError && (
                <Grid item xs={12}>
                  <Alert severity="error" onClose={() => setAlertError('')}>
                    {alertError}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status History
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {statusHistory.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    bgcolor: entry.status === 'up' ? 'success.light' : 'error.light'
                  }}
                >
                  <Typography>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Typography>
                  <Typography>
                    Status: {entry.status.toUpperCase()} (Code: {entry.statusCode || 'N/A'})
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WebsiteDetails; 