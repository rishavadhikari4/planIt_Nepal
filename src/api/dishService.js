import API from './api'; // Adjust the import based on your project structure


export const getAllDishCategories = async () => {
  try {
    const response = await API.get('/api/dishes');
    console.log('Dish categories fetched successfully:', response.data.categories);
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching dish categories:', error);
    return [];
  }
};

// export const submitDishes = (selectedDishes) => {
//   localStorage.setItem("selectedDishes", JSON.stringify(selectedDishes));
//   // Future API call to backend
//   return Promise.resolve({ success: true });
// };
