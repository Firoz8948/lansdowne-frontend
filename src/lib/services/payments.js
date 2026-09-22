import apiClient from '../api';

export const paymentService = {
  getConfig() {
    return apiClient.get('/payments/config');
  },

  createOrder(payload) {
    return apiClient.post('/payments/create-order', payload);
  },

  verify(payload) {
    return apiClient.post('/payments/verify', payload);
  },
};

export default paymentService;
