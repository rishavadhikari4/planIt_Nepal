import API from './api'; // Adjust the import based on your project structure




export const getAllDecorations = async () => {
  try {
    const response = await API.get('/api/decorations');
    return response.data.decorations;
  } catch (err) {
    console.error("Error Fetching decorations:", err);
    return [];
  }
};

// export const chooseDecoration = (decorationId) => {
//   localStorage.setItem("selectedDecoration", decorationId);
//   // Future API call to backend
//   return Promise.resolve({ success: true });
// };