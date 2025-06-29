import API from './api'; // adjust path if needed

// Fetch all users
export const fetchUsers = async () => {
  const res = await API.get('/api/auth/allUsers');
  return res.data;
};

// Delete a user by ID
export const deleteUser = async (id) => {
  await API.delete(`/api/auth/${id}`);
};

//fetch the login user in the ID
export const fetchLoginUser = async () =>{
  const res = await API.get('/api/auth/profile');
  return res.data;
}

