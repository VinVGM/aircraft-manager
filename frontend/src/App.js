import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Fade, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Overview2D from './components/Overview2D';
import NavigationBar from './components/NavigationBar';
import AddAircraftPanel from './components/AddAircraftPanel';
import RunwayStatusPanel from './components/RunwayStatusPanel';
import AirborneAircraftList from './components/AirborneAircraftList';
import GroundAircraftList from './components/GroundAircraftList';

const API_BASE_URL = 'https://hidden-vanya-vgm-enterprises-60347566.koyeb.app/api';

function App() {
  const [aircraft, setAircraft] = useState([]);
  const [runwayStatus, setRunwayStatus] = useState('No aircraft currently using the runway');
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
        light: darkMode ? '#e3f2fd' : '#42a5f5',
        dark: darkMode ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
        light: darkMode ? '#fce4ec' : '#ff4081',
        dark: darkMode ? '#f06292' : '#9a0036',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/aircraft`);
        setAircraft(response.data);
        
        // Update runway status
        const landingAircraft = response.data.find(a => a.status === 'landing');
        const takeoffAircraft = response.data.find(a => a.status === 'takeoff');
        
        if (landingAircraft) {
          setRunwayStatus(`Aircraft ${landingAircraft.flight_number} is currently landing`);
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

  const getRunwayProgress = (aircraft) => {
    if (!aircraft) return 0;
    const startTime = aircraft.status === 'landing' ? aircraft.landing_start_time : aircraft.takeoff_start_time;
    if (!startTime) return 0;
    const elapsed = (Date.now() / 1000) - startTime;
    const total = 5; // 5 seconds for both landing and takeoff
    const remaining = Math.max(total - elapsed, 0);
    return (remaining / total) * 100;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router>
        <NavigationBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={
            <>
              <Fade in timeout={1000}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                  Aircraft Landing Manager
                </Typography>
              </Fade>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <AddAircraftPanel onAddAircraft={addAircraft} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <RunwayStatusPanel 
                      runwayStatus={runwayStatus} 
                      aircraft={aircraft} 
                      getRunwayProgress={getRunwayProgress} 
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <AirborneAircraftList aircraft={aircraft} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <GroundAircraftList aircraft={aircraft} />
                  </Grid>
              </Grid>
            </>
          } />
          <Route path="/overview" element={<Overview2D />} />
        </Routes>
      </Container>
    </Router>
    </ThemeProvider>
  );
}

export default App;
