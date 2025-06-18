//this is the part which handels the req for the API for the reviews
import API from './api';

export const getVerifiedReviews = async () => {
  try {
    const response = await API.get('/api/review/verified-reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error.response ? error.response.data : error.message);
    return [];
  }
};

export const postReview = async ({ rating, comment}) => {
  try {
    const body = { rating, comment };
    const response = await API.post('/api/review', body);
    return response.data;
  } catch (error) {
    console.error('Error posting review:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to post review.'
    );
  }
};

export const getAllReviews = async () => {
  try {
    const response = await API.get('/api/review/all-reviews');
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    return [];
  }
};

export const toggleVerified = async (id) => {
  try {
    const response = await API.patch(`/api/review/toggle-verified/${id}`);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await API.delete(`/api/review/${id}`);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    throw error;
  }
};


