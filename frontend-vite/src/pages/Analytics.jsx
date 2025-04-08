import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Switch,
  FormControlLabel,
  Container,
  Paper
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [timePeriod, setTimePeriod] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseTimeData, setResponseTimeData] = useState(null);
  const [uptimeData, setUptimeData] = useState(null);
  const [downtimeData, setDowntimeData] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchWebsites();
    
    // Simple API check
    const checkApiConnection = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/status`);
        console.log('API status check:', response.data);
      } catch (err) {
        console.error('API connection check failed:', err);
        console.log('API base URL:', config.API_URL);
      }
    };
    
    checkApiConnection();
  }, []);

  useEffect(() => {
    if (useMockData) {
      setError('');
      generateMockData();
    } else if (selectedWebsite) {
      fetchAnalytics();
    }
  }, [useMockData, selectedWebsite, timePeriod]);

  const fetchWebsites = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/websites`);
      setWebsites(response.data);
      if (response.data.length > 0) {
        setSelectedWebsite(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    console.log('Generating mock data for demonstration purposes');
    
    // Mock response time data (last 24 hours)
    const mockResponseTimeData = {
      labels: Array.from({ length: 24 }, (_, i) => new Date(Date.now() - (23-i) * 3600000).toLocaleTimeString()),
      datasets: [
        {
          label: 'Response Time (ms)',
          data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 500) + 100),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
    
    // Mock uptime data
    const mockUptimeData = {
      labels: ['Uptime'],
      datasets: [
        {
          label: 'Uptime Percentage',
          data: [Math.floor(Math.random() * 10) + 90], // 90-99%
          backgroundColor: 'rgba(75, 192, 192, 0.5)'
        }
      ]
    };
    
    // Mock downtime data
    const mockDowntimeData = {
      labels: Array.from({ length: 5 }, (_, i) => new Date(Date.now() - i * 86400000).toLocaleString()),
      datasets: [
        {
          label: 'Downtime Incidents',
          data: Array.from({ length: 5 }, () => 1),
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ]
    };
    
    setResponseTimeData(mockResponseTimeData);
    setUptimeData(mockUptimeData);
    setDowntimeData(mockDowntimeData);
  };

  const fetchAnalytics = async () => {
    try {
      setError('');
      
      console.log(`Fetching analytics for website ID: ${selectedWebsite}`);
      
      // Try both endpoint formats
      let responseTimeRes, uptimeRes, downtimeRes;
      
      try {
        // First format: /websites/{id}/analytics/...
        [responseTimeRes, uptimeRes, downtimeRes] = await Promise.all([
          axios.get(`${config.API_URL}/websites/${selectedWebsite}/analytics/response-time?period=${timePeriod}`),
          axios.get(`${config.API_URL}/websites/${selectedWebsite}/analytics/uptime?period=${timePeriod}`),
          axios.get(`${config.API_URL}/websites/${selectedWebsite}/analytics/downtime?period=${timePeriod}`)
        ]);
      } catch (firstErr) {
        console.log('First endpoint format failed, trying alternate format...');
        try {
          // Second format: /analytics/{id}/...
          [responseTimeRes, uptimeRes, downtimeRes] = await Promise.all([
            axios.get(`${config.API_URL}/analytics/${selectedWebsite}/response-time?period=${timePeriod}`),
            axios.get(`${config.API_URL}/analytics/${selectedWebsite}/uptime?period=${timePeriod}`),
            axios.get(`${config.API_URL}/analytics/${selectedWebsite}/downtime?period=${timePeriod}`)
          ]);
        } catch (secondErr) {
          console.log('Second endpoint format failed, trying final format...');
          // Third format: /api/analytics/{type}/{id}
          [responseTimeRes, uptimeRes, downtimeRes] = await Promise.all([
            axios.get(`${config.API_URL}/api/analytics/response-time/${selectedWebsite}?period=${timePeriod}`),
            axios.get(`${config.API_URL}/api/analytics/uptime/${selectedWebsite}?period=${timePeriod}`),
            axios.get(`${config.API_URL}/api/analytics/downtime/${selectedWebsite}?period=${timePeriod}`)
          ]);
        }
      }
      
      console.log('Response time data:', responseTimeRes.data);
      console.log('Uptime data:', uptimeRes.data);
      console.log('Downtime data:', downtimeRes.data);

      // Prepare response time data
      const responseTimeHistory = responseTimeRes.data;
      if (responseTimeHistory && Array.isArray(responseTimeHistory) && responseTimeHistory.length > 0) {
        setResponseTimeData({
          labels: responseTimeHistory.map(item => new Date(item.timestamp).toLocaleTimeString()),
          datasets: [
            {
              label: 'Response Time (ms)',
              data: responseTimeHistory.map(item => item.responseTime),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)', 
              tension: 0.1,
              fill: true
            }
          ]
        });
      } else {
        setResponseTimeData({
          labels: [],
          datasets: [
            {
              label: 'Response Time (ms)',
              data: [],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });
      }

      // Prepare uptime data
      if (uptimeRes.data && typeof uptimeRes.data.uptime === 'number') {
        setUptimeData({
          labels: ['Uptime'],
          datasets: [
            {
              label: 'Uptime Percentage',
              data: [uptimeRes.data.uptime],
              backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }
          ]
        });
      } else {
        setUptimeData({
          labels: ['Uptime'],
          datasets: [
            {
              label: 'Uptime Percentage',
              data: [0],
              backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }
          ]
        });
      }

      // Prepare downtime data
      const downtimeHistory = downtimeRes.data;
      if (downtimeHistory && Array.isArray(downtimeHistory) && downtimeHistory.length > 0) {
        setDowntimeData({
          labels: downtimeHistory.map(item => new Date(item.timestamp).toLocaleString()),
          datasets: [
            {
              label: 'Downtime Incidents',
              data: downtimeHistory.map(() => 1),
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        });
      } else {
        setDowntimeData({
          labels: [],
          datasets: [
            {
              label: 'Downtime Incidents',
              data: [],
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
      
      // Use mock data in development mode or when requested
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        generateMockData();
      } else {
        // Set default empty states for all charts
        setResponseTimeData({
          labels: [],
          datasets: [
            {
              label: 'Response Time (ms)',
              data: [],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });
        
        setUptimeData({
          labels: ['Uptime'],
          datasets: [
            {
              label: 'Uptime Percentage',
              data: [0],
              backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }
          ]
        });
        
        setDowntimeData({
          labels: [],
          datasets: [
            {
              label: 'Downtime Incidents',
              data: [],
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        });
      }
    }
  };

  // Chart common options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 1: return "Last Hour";
      case 24: return "Last 24 Hours";
      case 168: return "Last Week";
      case 720: return "Last Month";
      default: return `Last ${timePeriod} Hours`;
    }
  };

  const getSelectedWebsiteName = () => {
    const website = websites.find(w => w._id === selectedWebsite);
    return website ? website.name : 'Select a website';
  };

  return (
    <Box sx={{ 
      bgcolor: '#121212', 
      minHeight: '100vh',
      color: '#fff',
      pt: 3,
      pb: 5
    }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Typography variant="h4" fontWeight="500">
              Analytics Dashboard
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: { xs: '100%', md: 'auto' }
            }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Website</InputLabel>
                <Select
                  value={selectedWebsite}
                  onChange={(e) => setSelectedWebsite(e.target.value)}
                  disabled={useMockData}
                  label="Website"
                >
                  {websites.map(website => (
                    <MenuItem key={website._id} value={website._id}>
                      {website.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  disabled={useMockData}
                  label="Time Period"
                >
                  <MenuItem value={1}>Last Hour</MenuItem>
                  <MenuItem value={24}>Last 24 Hours</MenuItem>
                  <MenuItem value={168}>Last Week</MenuItem>
                  <MenuItem value={720}>Last Month</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel 
                control={
                  <Switch 
                    checked={useMockData} 
                    onChange={(e) => setUseMockData(e.target.checked)}
                    color="primary"
                  />
                } 
                label="Use Demo Data" 
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>
          
          {/* Summary Banner */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'rgba(75, 192, 192, 0.15)', 
              border: '1px solid rgba(75, 192, 192, 0.3)', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography variant="h6" fontWeight="400">
              {getSelectedWebsiteName()}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              px: 1, 
              py: 0.5, 
              bgcolor: 'rgba(75, 192, 192, 0.2)', 
              borderRadius: 1 
            }}>
              <Typography variant="body2">
                {getTimePeriodLabel()}
              </Typography>
            </Box>
            {(uptimeData && uptimeData.datasets[0].data[0] > 0) && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                ml: 'auto',
                px: 1.5, 
                py: 0.5, 
                bgcolor: 'rgba(75, 192, 192, 0.2)', 
                borderRadius: 1 
              }}>
                <Typography variant="body2" fontWeight="500">
                  Uptime: {uptimeData.datasets[0].data[0].toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Error Messages */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
          
          {/* Response Time Chart */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: '#1e1e1e', 
              borderRadius: 2,
              border: '1px solid #333'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="500">
              Response Time Trend
            </Typography>
            <Box sx={{ height: 350, pt: 1 }}>
              {responseTimeData && responseTimeData.labels && responseTimeData.labels.length > 0 ? (
                <Line
                  data={responseTimeData}
                  options={{
                    ...chartOptions,
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: '#aaa'
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: '#aaa'
                        },
                        title: {
                          display: true,
                          text: 'Response Time (ms)',
                          color: '#aaa'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No response time data available for this period.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Metrics Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#1e1e1e', 
                  borderRadius: 2,
                  border: '1px solid #333',
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="500">
                  Uptime Percentage
                </Typography>
                <Box sx={{ height: 300, width: 475, pt: 1 }}>
                  {uptimeData && uptimeData.datasets[0].data.length > 0 ? (
                    <Bar
                      data={uptimeData}
                      options={{
                        ...chartOptions,
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: '#aaa'
                            }
                          },
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: '#aaa'
                            },
                            title: {
                              display: true,
                              text: 'Percentage',
                              color: '#aaa'
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No uptime data available for this period.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#1e1e1e', 
                  borderRadius: 2,
                  border: '1px solid #333',
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="500" >
                  Downtime Incidents
                </Typography>
                <Box sx={{ height: 300, pt: 1, width: 474 }}>
                  {downtimeData && downtimeData.labels && downtimeData.labels.length > 0 ? (
                    <Bar
                      data={downtimeData}
                      options={{
                        ...chartOptions,
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: '#aaa'
                            }
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: '#aaa'
                            },
                            title: {
                              display: true,
                              text: 'Number of Incidents',
                              color: '#aaa'
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No downtime incidents recorded for this period.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Analytics; 