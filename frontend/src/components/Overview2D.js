import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import './Overview2D.css';

const Overview2D = () => {
  const theme = useTheme();
  const [aircraft, setAircraft] = useState({
    runway: [],
    airborne: [],
    ground: []
  });

  // Define distance levels in nautical miles
  const distanceLevels = [10, 9, 8, 7, 6, 5, 4, 2];



  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        const response = await fetch('https://aircraft-manager-evnm.onrender.com/api/aircraft');
        const data = await response.json();
        
        // Categorize aircraft based on their status
        const categorized = {
          runway: data.filter(a => a.status === 'landing' || a.status === 'takeoff'),
          airborne: data.filter(a => a.status === 'in_air'),
          ground: data.filter(a => a.status === 'ground')
        };
        
        // Sort airborne aircraft by distance for consistent rendering
        categorized.airborne.sort((a, b) => b.distance - a.distance);
        
        setAircraft(categorized);
      } catch (error) {
        console.error('Error fetching aircraft:', error);
      }
    };

    fetchAircraft();
    const interval = setInterval(fetchAircraft, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set CSS variables based on theme
    document.documentElement.style.setProperty('--background-color', theme.palette.background.default);
    document.documentElement.style.setProperty('--paper-color', theme.palette.background.paper);
    document.documentElement.style.setProperty('--text-color', theme.palette.text.primary);
  }, [theme]);

  const getAirbornePosition = (index, total, distance) => {
    // Calculate vertical position based on distance
    const maxDistance = Math.max(...distanceLevels);
    const minDistance = Math.min(...distanceLevels);
    
    // Clamp the distance between min and max
    const clampedDistance = Math.min(Math.max(distance, minDistance), maxDistance);
    
    // Calculate the percentage position
    const range = maxDistance - minDistance;
    const normalizedDistance = (clampedDistance - minDistance) / range;
    const verticalPosition = (1 - normalizedDistance) * 90 + 5; // Leave 5% padding top and bottom
    
    // Calculate horizontal position based on index
    const horizontalSpacing = 80 / (total + 1); // Leave 10% padding on each side
    const horizontalPosition = (index + 1) * horizontalSpacing + 10;
    
    return {
      top: `${verticalPosition}%`,
      left: `${horizontalPosition}%`
    };
  };

  // Calculate position for distance level lines
  const getDistanceLevelPosition = (distance) => {
    const maxDistance = Math.max(...distanceLevels);
    const minDistance = Math.min(...distanceLevels);
    const range = maxDistance - minDistance;
    const normalizedDistance = (distance - minDistance) / range;
    return (1 - normalizedDistance) * 90 + 5; // Leave 5% padding top and bottom
  };

  return (
    <div className="overview-container">
      <div className="overview-section runway-section">
        <h2>Runway View</h2>
        <div className="runway-visualization">
          <div className="runway-end-left"></div>
          <div className="runway-end-right"></div>
          {aircraft.runway.map(plane => (
            <div 
              key={plane.id} 
              className="aircraft runway-aircraft"
              data-status={plane.status}
            >
              <div className="aircraft-icon">✈️</div>
              <div className="aircraft-info">
                <span>Flight: {plane.flight_number}</span>
                <span>Status: {plane.status}</span>
                {plane.is_emergency && <span className="emergency">Emergency</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-section airborne-section">
        <h2>Airborne Aircraft</h2>
        <div className="airborne-visualization">
          {/* Distance level lines and labels */}
          {distanceLevels.map(distance => (
            <React.Fragment key={distance}>
              <div 
                className="distance-level"
                style={{ top: `${getDistanceLevelPosition(distance)}%` }}
              />
              <div 
                className="distance-label"
                style={{ top: `${getDistanceLevelPosition(distance)}%` }}
              >
                {distance}nm
              </div>
            </React.Fragment>
          ))}
          
          {/* Aircraft */}
          {aircraft.airborne.map((plane, index) => (
            <div 
              key={plane.id} 
              className="aircraft airborne-aircraft"
              style={getAirbornePosition(index, aircraft.airborne.length, plane.distance)}
            >
              <div className="aircraft-icon">✈️</div>
              <div className="aircraft-info">
                <span>Flight: {plane.flight_number}</span>
                <span>Distance: {plane.distance.toFixed(1)}nm</span>
                {plane.is_emergency && <span className="emergency">Emergency</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-section ground-section">
        <h2>Ground Aircraft</h2>
        <div className="ground-visualization">
          {aircraft.ground.map(plane => (
            <div key={plane.id} className="aircraft ground-aircraft">
              <div className="aircraft-icon">✈️</div>
              <div className="aircraft-info">
                <span>Flight: {plane.flight_number}</span>
                <span>Status: {plane.status}</span>
                {plane.is_emergency && <span className="emergency">Emergency</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview2D; 