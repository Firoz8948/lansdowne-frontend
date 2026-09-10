import apiClient from '../api';

export const adminService = {
  async getDashboardStats() {
    return apiClient.get('/admin/dashboard');
  },

  async getAdminProducts(params = {}) {
    return apiClient.get('/admin/products', { params });
  },

  async createProduct(productData) {
    return apiClient.post('/admin/products', productData);
  },

  async updateProduct(id, productData) {
    return apiClient.put(`/admin/products/${id}`, productData);
  },

  async deleteProduct(id) {
    return apiClient.delete(`/admin/products/${id}`);
  },

  async getAdminOrders(params = {}) {
    return apiClient.get('/admin/orders', { params });
  },

  async updateOrderStatus(orderId, status) {
    return apiClient.patch(`/admin/orders/${orderId}/status`, { status });
  },

  // Categories
  async getCategories() {
    return apiClient.get('/categories/admin/all');
  },

  async createCategory(categoryData) {
    return apiClient.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`);
  },

  async uploadCategoryImage(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/categories/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adminService;
