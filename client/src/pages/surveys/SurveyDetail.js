import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SurveyDetail = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Survey Details
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1">
            This component is under development. It will display detailed information about a specific survey.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => navigate('/surveys')}>
              Back to Surveys
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SurveyDetail;

