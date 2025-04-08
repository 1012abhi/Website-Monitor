import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  useTheme,
  Paper,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SpeedIcon from '@mui/icons-material/Speed';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import SecurityIcon from '@mui/icons-material/Security';

const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <VisibilityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Real-time Monitoring',
      description: 'Get instant visibility into your website performance and availability 24/7.'
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Instant Alerts',
      description: 'Receive immediate notifications via email when your websites go down.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Response Time Tracking',
      description: 'Track response times and identify performance bottlenecks before they impact users.'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Detailed Analytics',
      description: 'Visualize uptime statistics and performance metrics with interactive charts.'
    },
    {
      icon: <DownloadDoneIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Downtime History',
      description: 'Access comprehensive logs of past incidents to identify patterns.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'SSL Monitoring',
      description: 'Get notified before your SSL certificates expire to maintain secure connections.'
    }
  ];

  const pricingPlans = [
    {
      title: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Monitor up to 3 websites',
        '5-minute check interval',
        'Email notifications',
        '24 hours of history'
      ],
      buttonText: 'Get Started'
    },
    {
      title: 'Pro',
      price: '$15',
      period: 'per month',
      features: [
        'Monitor up to 20 websites',
        '1-minute check interval',
        'Email & SMS notifications',
        '30 days of history',
        'Custom status pages'
      ],
      buttonText: 'Try Pro',
      highlighted: true
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Unlimited websites',
        '30-second check intervals',
        'Priority support',
        'API access',
        'Custom integrations',
        '1 year of history'
      ],
      buttonText: 'Contact Us'
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      color: 'text.primary',
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          pt: 10,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 2
                }}
              >
                Know when your website is down before your customers do
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4
                }}
              >
                Reliable website monitoring with instant alerts when your site goes down. Get detailed uptime analytics to ensure maximum availability.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem'
                  }}
                >
                  Start Monitoring Free
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="hero-dashboard.svg" 
                alt="Dashboard Preview"
                sx={{ 
                  width: '100%',
                  maxWidth: 500,
                  borderRadius: 2,
                  boxShadow: 4
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Everything you need to ensure uptime
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: 700,
              mx: 'auto',
              color: 'text.secondary'
            }}
          >
            Our monitoring platform gives you complete visibility into your website's performance and availability.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      textAlign: 'center',
                      fontWeight: 'medium'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Simple, transparent pricing
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 700,
                mx: 'auto',
                color: 'text.secondary'
              }}
            >
              Whether you're monitoring a single website or an entire network, we have a plan that fits your needs.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  elevation={plan.highlighted ? 6 : 1}
                  sx={{ 
                    p: 4,
                    height: '100%',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    border: plan.highlighted ? `2px solid ${theme.palette.primary.main}` : 'none'
                  }}
                >
                  {plan.highlighted && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 15,
                        right: -30,
                        transform: 'rotate(45deg)',
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        py: 0.5,
                        px: 4
                      }}
                    >
                      Popular
                    </Box>
                  )}
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {plan.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography 
                      variant="h3" 
                      component="span" 
                      sx={{ fontWeight: 'bold' }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      component="span" 
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      /{plan.period}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {plan.features.map((feature, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <DownloadDoneIcon 
                          fontSize="small" 
                          sx={{ 
                            mr: 1,
                            color: theme.palette.primary.main
                          }} 
                        />
                        <Typography variant="body1">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button 
                    variant={plan.highlighted ? "contained" : "outlined"} 
                    color={plan.highlighted ? "primary" : "primary"}
                    fullWidth
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5
                    }}
                    component={RouterLink}
                    to="/register"
                  >
                    {plan.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call To Action */}
      <Box 
        sx={{ 
          py: 10,
          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              Start monitoring your websites today
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              Set up in minutes. No credit card required for free accounts.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem'
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Uptime Monitor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We help you keep your websites online and performing at their best.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Product
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={RouterLink} to="/features" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Features
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/pricing" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Pricing
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/customers" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Customers
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Resources
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={RouterLink} to="/docs" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Documentation
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/blog" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Blog
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/support" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Support
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={RouterLink} to="/about" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  About Us
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/careers" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Careers
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/contact" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={RouterLink} to="/privacy" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Privacy
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/terms" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Terms
                </Typography>
                <Typography variant="body2" component={RouterLink} to="/security" sx={{ textDecoration: 'none', color: 'text.secondary' }}>
                  Security
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Uptime Monitor. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 