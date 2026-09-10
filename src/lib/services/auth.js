import apiClient from '../api';
import Cookies from 'js-cookie';

export const authService = {
  async adminLogin(username, password) {
    const data = await apiClient.post('/admin/login', { username, password });
    if (data?.access_token) {
      Cookies.set('token', data.access_token, { expires: 7 });
    }
    return data;
  },

  async sendOtp(phone) {
    return apiClient.post('/send-otp', { phone });
  },

  async verifyOtp(phone, otp) {
    const data = await apiClient.post('/verify-otp', { phone, otp });
    if (data?.access_token) {
      Cookies.set('token', data.access_token, { expires: 7 });
    }
    return data;
  },

  logout() {
    Cookies.remove('token');
  },

  getToken() {
    return Cookies.get('token');
  },
};

export default authService;
