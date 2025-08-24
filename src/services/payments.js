import API from "./api";

export const startPayment = async (orderId, paymentAmount = null) => {
  try {
    const requestBody = {
      orderId,
    };

    if (paymentAmount) {
      requestBody.paymentAmount = paymentAmount;
    }

    console.log('Starting payment with:', {
      orderId,
      paymentAmount,
      requestBody,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL
    });
    
    const response = await API.post('/api/payments/start-payment', requestBody);
    console.log('Payment response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error starting payment:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
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