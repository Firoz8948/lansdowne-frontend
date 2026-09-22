import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

function resolveAuthToken(url = '', method = 'get') {
  const adminToken = Cookies.get('admin_token') || Cookies.get('token') || null;
  const customerToken = Cookies.get('customer_token') || null;
  const verb = String(method || 'get').toLowerCase();
  const path = String(url);

  const isPromoValidate = path.includes('/promocodes/validate');
  const isPromoAdminMutation =
    path.includes('/promocodes') &&
    !isPromoValidate &&
    ['post', 'put', 'patch', 'delete'].includes(verb);
  const isShippingZoneAdmin =
    path.includes('/shipping-zones') &&
    !path.includes('/shipping-zones/quote') &&
    !path.includes('/shipping-zones/pincode') &&
    (path.includes('/admin') || ['post', 'put', 'patch', 'delete'].includes(verb));

  const needsAdmin =
    path.includes('/admin') ||
    path.includes('/metafields') ||
    isPromoAdminMutation ||
    isShippingZoneAdmin ||
    (path.includes('/categories') &&
      (path.includes('/admin') || ['post', 'put', 'patch', 'delete'].includes(verb)));

  if (needsAdmin) return adminToken;
  return customerToken;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = resolveAuthToken(config.url || '', config.method);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail;
    const message =
      (typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || d).join(', ')
          : null) ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
