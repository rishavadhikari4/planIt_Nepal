import axios from 'axios';
const API_BASE_URL = 'https://wedding-planner-backend-drr8.onrender.com/';



const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// Get all venues from backend
export const getAllVenues = async () => {
  try {
    const response = await axios.get(API_BASE_URL+'api/venues',{headers: getAuthHeaders()});
    console.log('Venues fetched successfully:', response.data.venues);
    return response.data.venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
};

// //Get all the decorations from backend
export const getAllDecorations = async () =>{
  try{
    const response = await axios.get(API_BASE_URL+'api/decorations');
    console.log('Decorations fetched successfully:', response.data.decorations);
    return response.data.decorations;
  }catch(err){
    console.error("Error Feching decorations:", err);
    return [];
  }
};

export const submitContactForm = async (formData) =>{
  try{
    const response = await axios.post(API_BASE_URL+'api/contacts', formData)
    console.log('Contact submitted successfully:', response.data);
    return response.data;
  }catch(err){
    console.error('Error submitting contact form:', err);
    return {success: false, message: 'Error submitting contact form'};
  }
};

// Get all dish categories (with dishes) from backend
export const getAllDishCategories = async () => {
  try {
    const response = await axios.get(API_BASE_URL + 'api/dishes');
    console.log('Dish categories fetched successfully:', response.data.categories);
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching dish categories:', error);
    return [];
  }
};

export const submitDishes = (selectedDishes) => {
  console.log("Selected dishes:", selectedDishes);
  // Future API call to backend
  return Promise.resolve({ success: true });
};

export const chooseDecoration = (decorationId) => {
  console.log("Selected decoration:", decorationId);
  // Future API call to backend
  return Promise.resolve({ success: true });
};


// Handle venue selection
export const handleVenueSelection = (venueId) => {
  console.log("Selected venue:", venueId);
  // Future API call to backend
  return Promise.resolve({ success: true });
}
