import apiClient from '../api';

export const orderService = {
  async createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },

  async getOrder(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },

  async trackOrder(orderId, phone) {
    return apiClient.get('/orders/track', { params: { order_id: orderId, phone } });
  },
};

export default orderService;
