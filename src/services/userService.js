import API from './api'; // adjust path if needed

// Fetch all users
export const fetchUsers = async () => {
  const res = await API.get('/api/auth/allUsers');
  return res.data;
};

// Delete a user by ID
export const deleteUser = async (id) => {
  await API.delete(`/api/auth/oneAccount/${id}`);
};

//fetch the login user in the ID
export const fetchLoginUser = async () =>{
  const res = await API.get('/api/auth/profile');
  return res.data;
}

export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await API.patch('/api/auth/update-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export const updateProfile = async (userData) => {
  const res = await API.patch('/api/auth/update-profile', userData);
  return res.data;
};

export const deleteAccountOfOwn = async (userId, password) => {
  const res = await API.delete(`/api/auth/ownAccount/${userId}`, {
    data: { password }, // axios requires `data` inside config object for DELETE
  });
  return res.data;
};



