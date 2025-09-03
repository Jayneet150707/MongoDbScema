import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserReport = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Survey Report
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1">
            This component is under development. It will display a detailed report of a user's responses to a specific survey.
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

export default UserReport;

