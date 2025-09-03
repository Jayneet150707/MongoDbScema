import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SurveyComplete = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Survey Completed
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1" paragraph>
            Thank you for completing the survey! Your responses have been recorded.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your feedback is valuable to us and will help improve our services.
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

export default SurveyComplete;

