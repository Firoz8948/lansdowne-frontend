import apiClient from '../api';

export const productService = {
  async getProducts(params = {}) {
    return apiClient.get('/products', { params });
  },

  async getProduct(slugOrId) {
    return apiClient.get(`/products/${slugOrId}`);
  },

  async getCategories() {
    return apiClient.get('/categories');
  },

  async getVideoProducts() {
    return apiClient.get('/video-products');
  },
};

export default productService;
