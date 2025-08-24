import API from './api';

export const submitContactForm = async (formData) => {
  try {
    const response = await API.post('/api/contacts/form', formData);
    return {
      success: true,
      message: response.data.message || 'Contact form submitted successfully!'
    };
  } catch (err) {
    console.error('Error submitting contact form:', err);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Error submitting contact form. Please try again.' 
    };
  }
};

export const getContacts = async ({ page = 1, limit = 10, subject = "" } = {}) => {
  try {
    const params = { page, limit };
    if (subject) params.subject = subject;
    const response = await API.get('/api/contacts/form', { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to fetch contacts'
    };
  }
};

