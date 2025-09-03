import axios from 'axios';

// Survey API
export const surveyApi = {
  // Get all surveys
  getSurveys: async (params = {}) => {
    try {
      const response = await axios.get('/api/surveys', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching surveys:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch surveys' 
      };
    }
  },

  // Get upcoming surveys
  getUpcomingSurveys: async () => {
    try {
      const response = await axios.get('/api/surveys/upcoming');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching upcoming surveys:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch upcoming surveys' 
      };
    }
  },

  // Get active surveys
  getActiveSurveys: async () => {
    try {
      const response = await axios.get('/api/surveys/active');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching active surveys:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch active surveys' 
      };
    }
  },

  // Get a single survey
  getSurvey: async (id) => {
    try {
      const response = await axios.get(`/api/surveys/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching survey ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch survey' 
      };
    }
  },

  // Create a new survey
  createSurvey: async (surveyData) => {
    try {
      const response = await axios.post('/api/surveys', surveyData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error creating survey:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create survey' 
      };
    }
  },

  // Update a survey
  updateSurvey: async (id, surveyData) => {
    try {
      const response = await axios.put(`/api/surveys/${id}`, surveyData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error updating survey ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update survey' 
      };
    }
  },

  // Delete a survey
  deleteSurvey: async (id) => {
    try {
      await axios.delete(`/api/surveys/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting survey ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete survey' 
      };
    }
  },

  // Update survey status
  updateSurveyStatus: async (id, status) => {
    try {
      const response = await axios.put(`/api/surveys/${id}/status`, { status });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error updating survey status ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update survey status' 
      };
    }
  },

  // Generate consent records for a survey
  generateConsentRecords: async (id) => {
    try {
      const response = await axios.post(`/api/surveys/${id}/generate-consent`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error generating consent records for survey ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to generate consent records' 
      };
    }
  }
};

// Question API
export const questionApi = {
  // Get all questions for a survey
  getQuestions: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/questions`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching questions for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch questions' 
      };
    }
  },

  // Get a single question
  getQuestion: async (id) => {
    try {
      const response = await axios.get(`/api/questions/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch question' 
      };
    }
  },

  // Create a new question
  createQuestion: async (questionData) => {
    try {
      const response = await axios.post('/api/questions', questionData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error creating question:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create question' 
      };
    }
  },

  // Update a question
  updateQuestion: async (id, questionData) => {
    try {
      const response = await axios.put(`/api/questions/${id}`, questionData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error updating question ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update question' 
      };
    }
  },

  // Delete a question
  deleteQuestion: async (id) => {
    try {
      await axios.delete(`/api/questions/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting question ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete question' 
      };
    }
  },

  // Upload questions from file
  uploadQuestions: async (surveyId, formData) => {
    try {
      const response = await axios.post(
        `/api/surveys/${surveyId}/questions/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error uploading questions for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to upload questions' 
      };
    }
  },

  // Download sample template
  downloadSampleTemplate: async (format = 'xlsx') => {
    try {
      const response = await axios.get(`/api/questions/sample-template?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sample_questions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading sample template:', error);
      return { 
        success: false, 
        message: 'Failed to download sample template' 
      };
    }
  }
};

// Consent API
export const consentApi = {
  // Record user consent
  recordConsent: async (token, consent) => {
    try {
      const response = await axios.post(`/api/consent/${token}`, { consent });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error recording consent:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to record consent' 
      };
    }
  },

  // Verify consent token
  verifyConsentToken: async (token) => {
    try {
      const response = await axios.get(`/api/consent/${token}/verify`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error verifying consent token:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to verify consent token' 
      };
    }
  },

  // Get consent status for a survey
  getSurveyConsentStatus: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/consent`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching consent status for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch consent status' 
      };
    }
  },

  // Check if user has given consent for a survey
  checkUserConsent: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/consent/check`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error checking user consent for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to check user consent' 
      };
    }
  }
};

// Response API
export const responseApi = {
  // Start a survey attempt
  startSurveyAttempt: async (surveyId) => {
    try {
      const response = await axios.post(`/api/surveys/${surveyId}/attempt`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error starting survey attempt for ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to start survey attempt' 
      };
    }
  },

  // Submit a response
  submitResponse: async (surveyId, responseData) => {
    try {
      const response = await axios.post(`/api/surveys/${surveyId}/responses`, responseData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error submitting response for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit response' 
      };
    }
  },

  // Complete a survey attempt
  completeSurveyAttempt: async (surveyId, attemptId) => {
    try {
      const response = await axios.put(`/api/surveys/${surveyId}/attempt/${attemptId}/complete`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error completing survey attempt ${attemptId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to complete survey attempt' 
      };
    }
  },

  // Get all responses for a survey
  getSurveyResponses: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/responses`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching responses for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch survey responses' 
      };
    }
  },

  // Get responses for a specific user
  getUserResponses: async (surveyId, userId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/responses/user/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching user responses for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch user responses' 
      };
    }
  },

  // Get survey participation statistics
  getSurveyParticipation: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/responses/participation`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching participation stats for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch participation statistics' 
      };
    }
  }
};

// Report API
export const reportApi = {
  // Generate survey report
  generateSurveyReport: async (surveyId) => {
    try {
      const response = await axios.get(`/api/reports/surveys/${surveyId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error generating report for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to generate survey report' 
      };
    }
  },

  // Generate user report
  generateUserReport: async (userId, surveyId) => {
    try {
      const response = await axios.get(`/api/reports/users/${userId}/surveys/${surveyId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error generating user report for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to generate user report' 
      };
    }
  },

  // Export survey results
  exportSurveyResults: async (surveyId, format = 'json') => {
    try {
      const response = await axios.get(`/api/reports/surveys/${surveyId}/export?format=${format}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });
      
      if (format !== 'json') {
        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `survey_results.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true };
      }
      
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error exporting results for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to export survey results' 
      };
    }
  }
};

// Notification API
export const notificationApi = {
  // Send notifications for active survey
  sendSurveyNotifications: async (surveyId) => {
    try {
      const response = await axios.post(`/api/surveys/${surveyId}/notifications/send`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error sending notifications for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send survey notifications' 
      };
    }
  },

  // Get notifications for a survey
  getSurveyNotifications: async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/notifications`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error fetching notifications for survey ${surveyId}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch survey notifications' 
      };
    }
  },

  // Get user's notifications
  getUserNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch user notifications' 
      };
    }
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    try {
      const response = await axios.put(`/api/notifications/${id}/read`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to mark notification as read' 
      };
    }
  }
};

