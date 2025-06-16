
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

export const getOneDecoration = async (id) => {
  try {
    const response = await API.get(`/api/decorations/${id}`);
    return response.data.decoration; // ✅ not `decorations`
  } catch (err) {
    console.error("Error Fetching the decoration", err);
    return null;
  }
};


export const deleteDecoration = async (id) => {
  try {
    const response = await API.delete(`/api/decorations/${id}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Error deleting decoration:", error);
    return {
      success: false,
      message:
        err.response?.data?.message || "Failed to delete decoration",
    };
  }
};

export const editDecoration = async (id, formData, onSuccess, onError) => {
  try {
    const response = await API.patch(
      `/api/decorations/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    onSuccess(response.data.message || "Decoration updated successfully!");
  } catch (err) {
    console.error("Error editing decoration:", err);
    const message =
      err.response?.data?.message || "Failed to update decoration";
    onError(message);
  }
};


// export const chooseDecoration = (decorationId) => {
//   localStorage.setItem("selectedDecoration", decorationId);
//   // Future API call to backend
//   return Promise.resolve({ success: true });
// };