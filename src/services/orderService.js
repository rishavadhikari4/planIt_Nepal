//this handels the orders routes
import API from "./api";

export const getAllOrders = async () => {
  try {
    const response = await API.get('/api/orders/all-orders');
    return response.data;
  } catch (err) {
    console.error("Error Fetching Orders", err);
    return [];
  }
};
