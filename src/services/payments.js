import API from "./api";

export const startPayment = async (orderId, paymentAmount = null) => {
  try {
    const requestBody = {
      orderId,
    };

    if (paymentAmount) {
      requestBody.paymentAmount = paymentAmount;
    }
    const response = await API.post('/api/payments/start-payment', requestBody);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkPaymentStatus = async (sessionId) => {
  try {
    const response = await API.get(`/api/payments/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error.response?.data || error.message);
    throw error;
  }
};