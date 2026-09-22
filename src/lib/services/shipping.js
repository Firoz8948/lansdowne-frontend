import apiClient from '../api';

export const shippingService = {
  lookupPincode(pincode) {
    return apiClient.get(`/shipping-zones/pincode/${pincode}`);
  },

  quote({ subtotal, state, pincode, payment_method = 'prepaid', weight_grams = 0 }) {
    return apiClient.post('/shipping-zones/quote', {
      subtotal,
      state,
      pincode,
      payment_method,
      weight_grams,
    });
  },
};

export default shippingService;
