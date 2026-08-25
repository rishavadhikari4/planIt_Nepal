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

/* `guestCount` is optional so older callers keep working; when it is given
   the server prices every dish per head from it. */
export const createOrder = async (items, guestCount = null) => {
  try {
    const response = await API.post("/api/orders", {
      items,
      ...(guestCount ? { guestCount } : {}),
    });
    return response.data;
  } catch (err) {
    console.error("Error Creating Order", err);
    throw err;
  }
};

/** What cancelling would return, before anyone commits to it. */
export const getCancellationQuote = async (orderId) => {
  const response = await API.get(`/api/orders/${orderId}/cancellation-quote`);
  return response.data.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await API.post(`/api/orders/${orderId}/cancel`, { reason });
  return response.data;
};

/** Admin: move one line of an order without touching the rest. */
export const updateOrderItemStatus = async (orderId, itemId, bookingStatus, note = "") => {
  const response = await API.patch(`/api/orders/${orderId}/items/${itemId}/status`, {
    bookingStatus,
    note,
  });
  return response.data;
};

/** Admin: record that a refund has actually been paid out. */
export const settleRefund = async (orderId, { amount, reference } = {}) => {
  const response = await API.post(`/api/orders/${orderId}/refund`, { amount, reference });
  return response.data;
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

