import API from './api';

// 1. Get all dish categories
export const getAllDishCategories = async () => {
  try {
    const response = await API.get('/api/dishes');
    // Backend sends: { message, categories }
    return response.data.categories; 
  } catch (error) {
    console.error('Error fetching dish categories:', error);
    return [];
  }
};

// 2. Get a specific dish category by NAME (not ID)
export const getDishCategoryByName = async (categoryName) => {
  try {
    const response = await API.get(`/api/dishes/${categoryName}`);
    // Backend sends: { message, dishes }
    // Return an object with dishes only or customize as needed
    return response.data.dishes;
  } catch (error) {
    console.error('Error fetching dish category:', error);
    return null;
  }
};

// 3. Edit a dish in a specific category by categoryId and dishId
export const editDish = async (categoryId, dishId, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/dishes/category/${categoryId}/dish/${dishId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    if (onSuccess) onSuccess(response.data.message);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update dish';
    if (onError) onError(message);
  }
};

// 4. Delete a dish in a specific category by categoryId and dishId
export const deleteDish = async (categoryId, dishId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/dishes/category/${categoryId}/dish/${dishId}`);
    if (onSuccess) onSuccess(response.data.message);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete dish';
    if (onError) onError(message);
  }
};

// 5. Get a particular dish by dishId
export const getDishById = async (dishId) => {
  try {
    const response = await API.get(`/api/dishes/dish/${dishId}`);
    // Backend sends: { message, dish, categoryId, categoryName }
    return response.data; // returns entire response object with dish info and category info
  } catch (error) {
    console.error('Error fetching dish:', error);
    return null;
  }
};

// 6. Delete a whole category by categoryId
export const deleteCategory = async (categoryId, onSuccess, onError) => {
  try {
    const response = await API.delete(`/api/dishes/category/${categoryId}`);
    if (onSuccess) onSuccess(response.data.message);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete category';
    if (onError) onError(message);
  }
};

// 7. Add dish to the database with the category
export const addDish = async (formData, onSuccess, onError) => {
  try {
    const response = await API.post('/api/dishes/upload-dish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (onSuccess) onSuccess(response.data.message, response.data.dish, response.data.updatedCategory);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add dish';
    if (onError) onError(message);
  }
};
