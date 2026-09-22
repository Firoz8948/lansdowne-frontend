import apiClient from '../api';

export const promoService = {
  validate({ code, subtotal, shipping_charge, phone }) {
    return apiClient.post('/promocodes/validate', {
      code,
      subtotal,
      shipping_charge,
      phone: phone || null,
    });
  },
};

export default promoService;
