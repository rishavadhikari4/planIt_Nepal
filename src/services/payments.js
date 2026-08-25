import API from "./api";

/**
 * Which gateways the server can actually reach. The checkout only offers a
 * method that is configured, instead of failing at the redirect.
 */
export const getPaymentMethods = async () => {
  const { data } = await API.get("/api/payments/methods");
  return data.methods;
};

/**
 * Start a payment.
 * provider: 'khalti' | 'fonepay' | 'cash'
 * paymentAmount: '25_percent' | 'full_payment' (omitted for cash)
 *
 * Gateway payments come back with a `redirectUrl` to send the browser to.
 * Cash comes back with the confirmed order.
 */
export const startPayment = async (orderId, provider, paymentAmount = null) => {
  const { data } = await API.post("/api/payments/start-payment", {
    orderId,
    provider,
    ...(paymentAmount ? { paymentAmount } : {}),
  });
  return data;
};

/**
 * Hand the gateway's return parameters back to the server, which confirms them
 * with the gateway before the order is marked paid. Safe to call twice — the
 * server treats an already-settled order as a success.
 */
export const verifyPayment = async (orderId, provider, params) => {
  const { data } = await API.post("/api/payments/verify", { orderId, provider, ...params });
  return data;
};

export const checkPaymentStatus = async (orderId) => {
  const { data } = await API.get(`/api/payments/status/${orderId}`);
  return data;
};
