import apiClient from '../api';
import Cookies from 'js-cookie';

const CUSTOMER_TOKEN = 'customer_token';
const ADMIN_TOKEN = 'admin_token';
const USER_COOKIE = 'customer_user';
/** Legacy cookie shared by older admin/customer flows */
const LEGACY_TOKEN = 'token';

export const authService = {
  async adminLogin(username, password) {
    const data = await apiClient.post('/admin/login', { username, password });
    if (data?.access_token) {
      Cookies.set(ADMIN_TOKEN, data.access_token, { expires: 7 });
      Cookies.remove(LEGACY_TOKEN);
    }
    return data;
  },

  async sendOtp(phone, name = '', mode = 'signin') {
    return apiClient.post('/otp/send', { phone, name, mode });
  },

  async verifyOtp(phone, otp, name = '', mode = 'signin') {
    const data = await apiClient.post('/otp/verify', { phone, otp, name, mode });
    if (data?.access_token) {
      Cookies.set(CUSTOMER_TOKEN, data.access_token, { expires: 7 });
      Cookies.remove(LEGACY_TOKEN);
    }
    if (data?.user) {
      Cookies.set(USER_COOKIE, JSON.stringify(data.user), { expires: 7 });
    }
    return data;
  },

  async getProfile() {
    const user = await apiClient.get('/auth/me');
    if (user) {
      Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 7 });
    }
    return user;
  },

  async updateProfile(payload) {
    const user = await apiClient.put('/auth/profile', payload);
    if (user) {
      Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 7 });
    }
    return user;
  },

  logout() {
    Cookies.remove(CUSTOMER_TOKEN);
    Cookies.remove(USER_COOKIE);
    Cookies.remove(LEGACY_TOKEN);
  },

  logoutAdmin() {
    Cookies.remove(ADMIN_TOKEN);
    Cookies.remove(LEGACY_TOKEN);
  },

  getToken() {
    return Cookies.get(CUSTOMER_TOKEN) || null;
  },

  getAdminToken() {
    return Cookies.get(ADMIN_TOKEN) || Cookies.get(LEGACY_TOKEN) || null;
  },

  getUser() {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  isAdminLoggedIn() {
    return Boolean(this.getAdminToken());
  },
};

export default authService;
