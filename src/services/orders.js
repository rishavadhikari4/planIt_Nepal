import API from "./api";

export const getAllOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    if (params.status) queryParams.append('status', params.status);

    const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await API.get(url);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return { orders: [], pagination: { totalOrders: 0, currentPage: 1, totalPages: 0, limit: 10 } };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await API.get('/api/orders/me');
    return response.data.data ? response.data.data.orders : [];
  } catch (err) {
    console.error("Error Fetching User Orders", err);
    throw err;
  }
};

export const createOrder = async (items) => {
  try {
    const response = await API.post("/api/orders", {
      items: items
    });
    return response.data;
  } catch (err) {
    console.error("Error Creating Order", err);
    throw err;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await API.patch(`/api/orders/${orderId}/status`, {
      status: newStatus
    });
    return response.data;
  } catch (err) {
    console.error("Error Updating Order Status", err);
    throw err;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await API.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (err) {
    console.error("Error Deleting Order", err);
    throw err;
  }
};

export const deleteAllUserOrders = async (userId) => {
  try {
    const response = await API.delete(`/api/orders/user/${userId}`);
    return response.data;
  } catch (err) {
    console.error("Error Deleting All User Orders", err);
    throw err;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await API.get(`/api/orders/${orderId}`)
    if (response.data.success) {
      return response.data.data.order
    }
    return null
  } catch (err) {
    console.error("Error Fetching Order by ID", err)
    throw err
  }
};

