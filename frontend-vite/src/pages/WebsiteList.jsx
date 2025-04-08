import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const WebsiteList = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: '',
    checkInterval: 0
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/websites`);
      console.log('API Response:', response.data);
      setWebsites(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to fetch websites: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = async () => {
    // Basic validation
    if (!newWebsite.name.trim()) {
      setAddError('Name is required');
      return;
    }

    if (!newWebsite.url.trim()) {
      setAddError('URL is required');
      return;
    }

    try {
      setAddLoading(true);
      setAddError('');
      
      await axios.post(`${config.API_URL}/websites`, newWebsite);
      
      // Reset form and close dialog
      setNewWebsite({
        name: '',
        url: '',
        checkInterval: 1
      });
      setOpenAddDialog(false);
      
      // Refresh website list
      fetchWebsites();
    } catch (err) {
      console.error('Error adding website:', err);
      setAddError('Failed to add website: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteWebsite = async (id) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        await axios.delete(`${config.API_URL}/websites/${id}`);
        // Refresh website list
        fetchWebsites();
      } catch (err) {
        console.error('Error deleting website:', err);
        setError('Failed to delete website: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWebsite({
      ...newWebsite,
      [name]: name === 'checkInterval' ? parseInt(value, 10) || 5 : value
    });
  };

  const handleViewClick = (website) => {
    console.log('Viewing website with ID:', website._id);
    // Check if the ID exists and has a valid format
    if (!website._id) {
      console.error('Invalid website ID:', website);
      setError('Cannot view website: Invalid ID');
      return;
    }
    
    try {
      // Navigate to the website details page with the Performance tab active
      navigate(`/websites/${website._id}#performance`);
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate to website details');
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150 
    },
    { 
      field: 'url', 
      headerName: 'URL', 
      flex: 1, 
      minWidth: 200 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color={
            params.value === 'up' 
              ? 'success.main' 
              : params.value === 'down' 
              ? 'error.main' 
              : 'warning.main'
          }
          sx={{ fontWeight: 'bold' }}
        >
          {params.value ? params.value.toUpperCase() : 'UNKNOWN'}
        </Typography>
      )
    },
    { 
      field: 'checkInterval', 
      headerName: 'Check Interval', 
      width: 150,
      renderCell: (params) => {
        console.log('checkInterval data:', params.row.checkInterval);
        // Access checkInterval directly from the row data
        const interval = params.row.checkInterval || 5; // Default to 5 if undefined
        return (
          <Typography>
            {interval} min{interval !== 1 ? 's' : ''}
          </Typography>
        );
      }
    },
    { 
      field: 'lastChecked', 
      headerName: 'Last Checked', 
      width: 200,
      renderCell: (params) => {
        console.log('lastChecked row data:', params.row);
        try {
          // Access lastChecked directly from the row data
          if (params.row.lastChecked) {
            return new Date(params.row.lastChecked).toLocaleString();
          } else {
            return 'Not checked yet';
          }
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Not checked yet';
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View performance & details">
            <IconButton 
              onClick={() => handleViewClick(params.row)}
              color="primary"
              size="small"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <IconButton 
            onClick={() => handleDeleteWebsite(params.row._id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Monitored Websites</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Website
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={websites.map(website => ({
              ...website,
              id: website._id || Math.random().toString() // DataGrid requires a unique id field
            }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }
            }}
          />
        )}
      </Box>

      {/* Add Website Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Website</DialogTitle>
        <DialogContent>
          {addError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Website Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newWebsite.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="url"
            label="Website URL"
            type="url"
            fullWidth
            variant="outlined"
            value={newWebsite.url}
            onChange={handleInputChange}
            placeholder="https://example.com"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="checkInterval"
            label="Check Interval (minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={newWebsite.checkInterval}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 60 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddWebsite} 
            variant="contained"
            disabled={addLoading}
          >
            {addLoading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebsiteList; 