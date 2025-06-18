//this handels the dishes api
import API from './api';


export const getAllDishCategories = async () => {
  try {
    const response = await API.get('/api/dishes');
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching dish categories:', error);
    return [];
  }
};

