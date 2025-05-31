import API from './api';

export const getAllReviews = async () => {
  try {
    const response = await API.get('/api/review');
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


