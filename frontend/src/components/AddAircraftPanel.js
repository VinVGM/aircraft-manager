import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Slide } from '@mui/material';

function AddAircraftPanel({ onAddAircraft }) {
  return (
    <Slide direction="right" in timeout={1000}>
      <Card sx={{ 
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}>
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
                onClick={() => onAddAircraft(false, false)}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Random Air Aircraft
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => onAddAircraft(true, false)}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Ground Aircraft
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => onAddAircraft(false, true)}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Emergency Air Aircraft
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => onAddAircraft(true, true)}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Add Emergency Ground Aircraft
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Slide>
  );
}

export default AddAircraftPanel; 