import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const NotificationList = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notifications
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <List>
            <ListItem>
              <ListItemText 
                primary="This component is under development" 
                secondary="It will display a list of notifications for the current user." 
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Sample Notification" 
                secondary="You have been invited to participate in a new survey." 
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotificationList;

