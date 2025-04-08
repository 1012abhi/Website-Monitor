import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert
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

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseTimeData, setResponseTimeData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First try to get websites
        const websitesRes = await axios.get(`${config.API_URL}/websites`);
        setWebsites(websitesRes.data);
        
        try {
          // Then try to get response time data - if this fails, we'll still have websites
          const responseTimeRes = await axios.get(`${config.API_URL}/analytics/response-time`);
          
          // Prepare response time data for chart
          const responseTimeHistory = responseTimeRes.data;
          if (responseTimeHistory && responseTimeHistory.length > 0) {
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
          }
        } catch (chartErr) {
          console.error('Error fetching response time data:', chartErr);
          // Continue showing the dashboard even without chart data
        }
      } catch (err) {
        console.error('Error fetching website data:', err);
        setError('Failed to fetch dashboard data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const totalWebsites = websites.length;
  const upWebsites = websites.filter(w => w.status === 'up').length;
  const downWebsites = websites.filter(w => w.status === 'down').length;
  const unknownWebsites = websites.filter(w => w.status !== 'up' && w.status !== 'down').length;
  const uptimePercentage = totalWebsites > 0 ? (upWebsites / totalWebsites) * 100 : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Websites
              </Typography>
              <Typography variant="h4">
                {totalWebsites}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Up Websites
              </Typography>
              <Typography variant="h4" color="success.main">
                {upWebsites}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Down Websites
              </Typography>
              <Typography variant="h4" color="error.main">
                {downWebsites}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unknown Websites
              </Typography>
              <Typography variant="h4" color="warning.main">
                {unknownWebsites}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Uptime
              </Typography>
              <Typography variant="h4">
                {uptimePercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {responseTimeData && (
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Status Changes
          </Typography>
          {websites.map(website => (
            <Box key={website._id} sx={{ mb: 2 }}>
              <Typography variant="body1">
                {website.name} ({website.url})
              </Typography>
              <Typography
                variant="body2"
                color={
                  website.status === 'up' 
                    ? 'success.main' 
                    : website.status === 'down' 
                    ? 'error.main' 
                    : 'warning.main'
                }
              >
                Status: {website.status ? website.status.toUpperCase() : 'UNKNOWN'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last checked: {website.lastChecked ? new Date(website.lastChecked).toLocaleString() : 'Not checked yet'}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 