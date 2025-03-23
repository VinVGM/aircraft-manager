import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Chip, LinearProgress, Grow, Zoom } from '@mui/material';

function AirborneAircraftList({ aircraft }) {
  return (
    <Grow in timeout={1000}>
      <Card sx={{ 
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Aircraft in Air
          </Typography>
          <List>
            {aircraft
              .filter(a => a.status === 'in_air')
              .map((a, index) => (
                <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }} key={a.id}>
                  <ListItem divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {a.flight_number}
                          </Typography>
                          {a.is_emergency && (
                            <Chip 
                              label="Emergency" 
                              color="error" 
                              size="small"
                              sx={{
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.1)' },
                                  '100%': { transform: 'scale(1)' }
                                }
                              }}
                            />
                          )}
                          {a.going_around && (
                            <Chip 
                              label="Going Around" 
                              color="warning" 
                              size="small"
                              sx={{
                                animation: 'shake 0.5s infinite',
                                '@keyframes shake': {
                                  '0%, 100%': { transform: 'translateX(0)' },
                                  '25%': { transform: 'translateX(-2px)' },
                                  '75%': { transform: 'translateX(2px)' }
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Distance: {a.distance.toFixed(2)} nm | Speed: {a.speed} nm/s
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(a.distance / 10) * 100}
                            color={a.distance <= (a.is_emergency ? 5 : 2) ? 'error' : 'primary'}
                            sx={{ 
                              mt: 1,
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                transition: 'width 0.5s ease-in-out'
                              }
                            }}
                          />
                          {a.distance <= (a.is_emergency ? 5 : 2) && !a.going_around && (
                            <Typography 
                              variant="caption" 
                              color="error" 
                              sx={{ 
                                mt: 1, 
                                display: 'block',
                                animation: 'blink 1s infinite',
                                '@keyframes blink': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.5 }
                                }
                              }}
                            >
                              Ready to land
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </Zoom>
              ))}
          </List>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default AirborneAircraftList; 