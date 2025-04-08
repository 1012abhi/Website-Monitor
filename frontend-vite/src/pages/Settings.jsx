import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import config from '../config';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    username: '',
    email: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || ''
      });
      
      // Fetch notification settings
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/users/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put(`${config.API_URL}/users/profile`, profile);
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put(`${config.API_URL}/users/password`, {
        currentPassword: password.current,
        newPassword: password.new
      });
      
      // Reset password fields
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
      
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put(`${config.API_URL}/users/notifications`, notifications);
      
      setSuccess('Notification preferences updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <form onSubmit={updateProfile}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                name="username"
                value={profile.username}
                onChange={handleProfileChange}
              />
              
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </form>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <form onSubmit={updatePassword}>
              <TextField
                fullWidth
                label="Current Password"
                variant="outlined"
                margin="normal"
                type="password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
              />
              
              <TextField
                fullWidth
                label="New Password"
                variant="outlined"
                margin="normal"
                type="password"
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                variant="outlined"
                margin="normal"
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    name="email"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.browser}
                    onChange={handleNotificationChange}
                    name="browser"
                    color="primary"
                  />
                }
                label="Browser Notifications"
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={updateNotifications}
                disabled={loading}
                sx={{ mt: 2, width: 'fit-content' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 