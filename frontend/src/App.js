import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Alert, List, ListItem, ListItemText, LinearProgress, Box, Chip } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [aircraft, setAircraft] = useState([]);
  const [runwayStatus, setRunwayStatus] = useState('No aircraft currently using the runway');

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/aircraft`);
        setAircraft(response.data);
        
        // Update runway status
        const landingAircraft = response.data.find(a => a.status === 'landing');
        const takeoffAircraft = response.data.find(a => a.status === 'takeoff');
        
        if (landingAircraft) {
          setRunwayStatus(`Aircraft ${landingAircraft.flight_number} is currently landing (Distance: ${landingAircraft.distance.toFixed(2)} nm)`);
        } else if (takeoffAircraft) {
          setRunwayStatus(`Aircraft ${takeoffAircraft.flight_number} is currently taking off`);
        } else {
          setRunwayStatus('No aircraft currently using the runway');
        }
      } catch (error) {
        console.error('Error fetching aircraft:', error);
      }
    };

    fetchAircraft();
    const interval = setInterval(fetchAircraft, 1000);
    return () => clearInterval(interval);
  }, []);

  const addAircraft = async (isGround, isEmergency) => {
    try {
      await axios.post(`${API_BASE_URL}/aircraft`, {
        is_ground: isGround,
        is_emergency: isEmergency
      });
    } catch (error) {
      console.error('Error adding aircraft:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'landing': return 'warning';
      case 'takeoff': return 'success';
      default: return 'info';
    }
  };

  const getEmergencyColor = (isEmergency) => {
    return isEmergency ? 'error' : 'primary';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Aircraft Landing Manager
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Aircraft
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => addAircraft(false, false)}
                  >
                    Add Random Air Aircraft
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => addAircraft(true, false)}
                  >
                    Add Ground Aircraft
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={() => addAircraft(false, true)}
                  >
                    Add Emergency Air Aircraft
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    onClick={() => addAircraft(true, true)}
                  >
                    Add Emergency Ground Aircraft
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Runway Status
              </Typography>
              <Alert severity={runwayStatus.includes('landing') ? 'warning' : 
                         runwayStatus.includes('taking off') ? 'success' : 'info'}>
                {runwayStatus}
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aircraft in Air
              </Typography>
              <List>
                {aircraft
                  .filter(a => a.status === 'in_air')
                  .map(a => (
                    <ListItem key={a.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {a.flight_number}
                            </Typography>
                            {a.is_emergency && (
                              <Chip label="Emergency" color="error" size="small" />
                            )}
                            {a.going_around && (
                              <Chip label="Going Around" color="warning" size="small" />
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
                              sx={{ mt: 1 }}
                            />
                            {a.distance <= (a.is_emergency ? 5 : 2) && !a.going_around && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                Ready to land
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ground Aircraft
              </Typography>
              <List>
                {aircraft
                  .filter(a => a.status === 'ground')
                  .map(a => (
                    <ListItem key={a.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {a.flight_number}
                            </Typography>
                            {a.is_emergency && (
                              <Chip label="Emergency" color="error" size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="success">
                            Ready for takeoff
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
