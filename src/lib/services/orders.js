import apiClient from '../api';

export const orderService = {
  async createCodOrder(orderData) {
    return apiClient.post('/orders/create', orderData);
  },

  async createOrder(orderData) {
    return this.createCodOrder(orderData);
  },

  async getOrder(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },

  async myOrders() {
    return apiClient.get('/orders/my');
  },

  async trackOrder(orderId, phone) {
    return apiClient.get('/orders/track', { params: { order_id: orderId, phone } });
  },
};

export default orderService;
