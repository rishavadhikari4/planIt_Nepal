import API from './api';

export const submitContactForm = async (formData) => {
  try {
    const response = await API.post('/api/contacts', formData);
    return response.data;
  } catch (err) {
    console.error('Error submitting contact form:', err);
    return { success: false, message: 'Error submitting contact form' };
  }
};

