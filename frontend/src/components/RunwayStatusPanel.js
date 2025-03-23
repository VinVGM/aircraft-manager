import React from 'react';
import { Card, CardContent, Typography, Box, Alert, LinearProgress, Slide } from '@mui/material';

function RunwayStatusPanel({ runwayStatus, aircraft, getRunwayProgress }) {
  return (
    <Slide direction="left" in timeout={1000}>
      <Card sx={{ 
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Runway Status
          </Typography>
          <Box sx={{ width: '100%' }}>
            <Alert 
              severity={runwayStatus.includes('landing') ? 'warning' : 
                       runwayStatus.includes('taking off') ? 'success' : 'info'}
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.01)'
                }
              }}
            >
              {runwayStatus}
            </Alert>
            {(aircraft.find(a => a.status === 'landing') || aircraft.find(a => a.status === 'takeoff')) && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={getRunwayProgress(aircraft.find(a => a.status === 'landing' || a.status === 'takeoff'))}
                  color={aircraft.find(a => a.status === 'landing') ? 'warning' : 'success'}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      transition: 'width 0.5s ease-in-out'
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    textAlign: 'center',
                    animation: 'fadeInOut 1s infinite',
                    '@keyframes fadeInOut': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 }
                    }
                  }}
                >
                  {aircraft.find(a => a.status === 'landing') ? 'Landing...' : 'Taking off...'}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );
}

export default RunwayStatusPanel; 