import API from './api';

export const getVerifiedReviews = async (limit = 6) => {
  try {
    const response = await API.get(`/api/reviews/verified?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching verified reviews:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch verified reviews');
  }
};

export const getUnverifiedReviews = async (limit = 6) => {
  try {
    const response = await API.get(`/api/reviews/un-verified?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unverified reviews:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch unverified reviews');
  }
};

export const postReview = async ({ rating, comment }) => {
  try {
    if (!rating) {
      throw new Error('Rating is required');
    }
    
    if (!comment || comment.trim() === '') {
      throw new Error('Comment is required');
    }

    const body = { 
      rating: parseInt(rating),
      comment: comment.trim()
    };
    
    const response = await API.post('/api/reviews', body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting review:', error);

    if (error.response) {
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Failed to post review.');
    }
  }
};

export const rateVenue = async (venueId, rating) => {
  try {
    const response = await API.post(`/api/venues/${venueId}/rate`, { 
      rating: parseInt(rating)
    });
    return {
      success: true,
      message: response.data.message || "Venue rated successfully!",
      data: response.data.data
    };
  } catch (error) {
    console.error("Error rating venue:", error);
    throw new Error(error.response?.data?.message || "Failed to rate venue");
  }
};

export const rateStudio = async (studioId, rating) => {
  try {
    const response = await API.post(`/api/studios/${studioId}/rate`, { 
      rating: parseInt(rating)
    });
    return {
      success: true,
      message: response.data.message || "Studio rated successfully!",
      data: response.data.data
    };
  } catch (error) {
    console.error("Error rating studio:", error);
    throw new Error(error.response?.data?.message || "Failed to rate studio");
  }
};

export const rateDish = async (dishId, rating) => {
  try {
    const response = await API.post(`/api/cuisines/dishes/${dishId}/rate`, { 
      rating: parseInt(rating)
    });
    return {
      success: true,
      message: response.data.message || "Dish rated successfully!",
      data: response.data.data
    };
  } catch (error) {
    console.error("Error rating dish:", error);
    throw new Error(error.response?.data?.message || "Failed to rate dish");
  }
};

export const getAllReviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.rating) queryParams.append('rating', params.rating);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/reviews?${queryString}` : '/api/reviews';
    
    const response = await API.get(url);

    if (response.data?.data?.reviews) {
      return response.data.data.reviews;
    }
    
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching all reviews:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
  }
};

export const toggleVerified = async (reviewId) => {
  try {
    const response = await API.patch(`/api/reviews/${reviewId}/verified`);
    return response.data;
  } catch (error) {
    console.error('Error toggling review verification:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to toggle review verification');
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await API.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete review');
  }
};


