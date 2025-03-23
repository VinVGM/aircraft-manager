import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Flight as FlightIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

function NavigationBar({ darkMode, onToggleDarkMode }) {
  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Aircraft Landing Manager
        </Typography>
        <IconButton 
          color="inherit" 
          onClick={onToggleDarkMode}
          sx={{ 
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <IconButton color="inherit" component={Link} to="/">
          <TimelineIcon />
        </IconButton>
        <IconButton color="inherit" component={Link} to="/overview">
          <FlightIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar; 