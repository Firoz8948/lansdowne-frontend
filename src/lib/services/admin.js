import apiClient from '../api';

export const adminService = {
  async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats');
  },

  async getAdminProducts(params = {}) {
    return apiClient.get('/admin/products', { params });
  },

  async getAdminProduct(id) {
    return apiClient.get(`/admin/products/${id}`);
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

  async uploadProductImages(productId, files) {
    const formData = new FormData();
    const list = Array.isArray(files) ? files : [files];
    list.forEach((file) => {
      if (file) formData.append('files', file);
    });
    return apiClient.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Upload image(s) to storage (Bunny CDN when configured) without requiring a product id. */
  async uploadLooseImages(files) {
    const list = (Array.isArray(files) ? files : [files]).filter(Boolean);
    const urls = [];
    for (const file of list) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/admin/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res?.url) urls.push(res.url);
    }
    return { urls };
  },

  async attachProductImageUrls(productId, urls) {
    return apiClient.post(`/admin/products/${productId}/images/from-urls`, { urls });
  },

  async getProductMediaLibrary(params = {}) {
    return apiClient.get('/admin/media/product-images', { params });
  },

  async removeProductImage(productId, imageUrl) {
    return apiClient.delete(`/admin/products/${productId}/images`, {
      params: { image_url: imageUrl },
    });
  },

  async getMetafieldDefinitions() {
    return apiClient.get('/metafields/admin/all');
  },

  async createMetafieldDefinition(name) {
    return apiClient.post('/metafields/', { name });
  },

  async updateMetafieldDefinition(id, data) {
    return apiClient.put(`/metafields/${id}`, data);
  },

  async deleteMetafieldDefinition(id) {
    return apiClient.delete(`/metafields/${id}`);
  },

  async getAdminOrders(params = {}) {
    return apiClient.get('/admin/orders', { params });
  },

  async updateOrderStatus(orderId, status) {
    return apiClient.put(`/admin/orders/${orderId}/status`, { status });
  },

  async getAdminPayments(params = {}) {
    return apiClient.get('/admin/payments', { params });
  },

  async getAdminCustomers(params = {}) {
    return apiClient.get('/admin/users/', { params });
  },

  async getAdminCustomer(id) {
    return apiClient.get(`/admin/users/${id}`);
  },

  // Catalog feeds (Watch & Shop video products)
  async getVideoProducts() {
    return apiClient.get('/admin/video-products');
  },

  async createVideoProduct(formData) {
    return apiClient.post('/admin/video-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateVideoProduct(id, formData) {
    return apiClient.put(`/admin/video-products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteVideoProduct(id) {
    return apiClient.delete(`/admin/video-products/${id}`);
  },

  async getBrandSettings() {
    return apiClient.get('/admin/settings');
  },

  async getMe() {
    return apiClient.get('/admin/me');
  },

  // Categories
  async getCategories() {
    return apiClient.get('/categories/admin/all');
  },

  async createCategory(categoryData) {
    return apiClient.post('/categories/', categoryData);
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

  // Promo codes
  async getPromoCodes() {
    return apiClient.get('/promocodes/admin/all');
  },

  async createPromoCode(data) {
    return apiClient.post('/promocodes/', data);
  },

  async updatePromoCode(id, data) {
    return apiClient.put(`/promocodes/${id}`, data);
  },

  async deletePromoCode(id) {
    return apiClient.delete(`/promocodes/${id}`);
  },

  // Shipping zones
  async getShippingZones() {
    return apiClient.get('/shipping-zones/admin/all');
  },

  async createShippingZone(data) {
    return apiClient.post('/shipping-zones/', data);
  },

  async updateShippingZone(id, data) {
    return apiClient.put(`/shipping-zones/${id}`, data);
  },

  async deleteShippingZone(id) {
    return apiClient.delete(`/shipping-zones/${id}`);
  },
};

export default adminService;
