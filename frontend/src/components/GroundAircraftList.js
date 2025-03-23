import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Chip, Grow, Zoom } from '@mui/material';

function GroundAircraftList({ aircraft }) {
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
            Ground Aircraft
          </Typography>
          <List>
            {aircraft
              .filter(a => a.status === 'ground')
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
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="success"
                          sx={{
                            animation: 'fadeInOut 2s infinite',
                            '@keyframes fadeInOut': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.7 }
                            }
                          }}
                        >
                          Ready for takeoff
                        </Typography>
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

export default GroundAircraftList; 