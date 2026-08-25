import API from './api';

export const fetchUsers = async () => {
  const res = await API.get('/api/users/');
  return res.data.users;
};

export const deleteUser = async (userId) => {
  const res = await API.delete(`/api/users/${userId}`);
  return res.data;
};

export const fetchLoginUser = async () => {
  const res = await API.get('/api/users/me');
  return res.data.user;
};

export const updateProfile = async (userData) => {
  const res = await API.patch('/api/users/me', userData);
  return res.data.user;
};

export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await API.patch('/api/users/me/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export const deleteAccountOfOwn = async (password) => {
  const res = await API.delete('/api/users/me', {
    data: { password }
  });
  return res.data;
};

export const getUserInspectionData = async (userId) => {
  try {
    const response = await API.get(`/api/users/inspect/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user inspection data:', error);
    throw error;
  }
};




/* ------------------------------------------------------------------ *
 * Shortlist
 * ------------------------------------------------------------------ */

/** The shortlist, resolved to the venues, studios and dishes it points at. */
export const getFavorites = async () => {
  const response = await API.get("/api/users/me/favorites");
  return response.data.data.favorites;
};

/**
 * Just the keys ("venue:abc123"), which is all a listing page needs to paint
 * its hearts in one request rather than one per card.
 */
export const getFavoriteIds = async () => {
  const response = await API.get("/api/users/me/favorites/ids");
  return new Set(response.data.data.ids);
};

/** Returns { favorited, count } — the server's answer, not our guess. */
export const toggleFavorite = async (itemType, itemId) => {
  const response = await API.post("/api/users/me/favorites/toggle", { itemType, itemId });
  return response.data.data;
};

/* ------------------------------------------------------------------ *
 * Cart
 * ------------------------------------------------------------------ */

export const getServerCart = async () => {
  const response = await API.get("/api/users/me/cart");
  return response.data.data.cart;
};

/** Replaces the stored cart. The client owns cart state; this remembers it. */
export const saveServerCart = async ({ items, guestCount }) => {
  const response = await API.put("/api/users/me/cart", { items, guestCount });
  return response.data;
};
