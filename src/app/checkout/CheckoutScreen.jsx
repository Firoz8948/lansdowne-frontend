'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopNowButton from '@/components/ShopNowButton';
import { useCart } from '@/context/CartContext';
import authService from '@/lib/services/auth';
import paymentService from '@/lib/services/payments';
import shippingService from '@/lib/services/shipping';
import orderService from '@/lib/services/orders';
import promoService from '@/lib/services/promos';
import apiClient from '@/lib/api';
import {
  INDIAN_STATES,
  formatPrice,
  digitsOnly,
  buildCheckoutItems,
  submitPayuForm,
  loadRazorpayScript,
} from './checkoutUtils';
import styles from './checkout.module.css';

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, totalItems, totalAmount, clearCart, hydrated } = useCart();

  const [form, setForm] = useState(emptyForm);
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [promoCode, setPromoCode] = useState('');
  const [showPromoField, setShowPromoField] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoApplying, setPromoApplying] = useState(false);
  const [baseShippingCharge, setBaseShippingCharge] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const paymentFailed = searchParams.get('payment') === 'failed';
  const failReason = searchParams.get('reason');

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.replace('/account/login?next=/checkout');
      return;
    }

    const user = authService.getUser();
    setForm((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      mobile: digitsOnly(user?.phone || '').slice(-10) || prev.mobile,
      email: user?.email?.includes('@mobile.') ? '' : user?.email || prev.email,
      line1: user?.address_line1 || prev.line1,
      line2: user?.address_line2 || prev.line2,
      landmark: user?.address_landmark || prev.landmark,
      city: user?.address_city || prev.city,
      state: user?.address_state || prev.state,
      pincode: user?.address_pincode || prev.pincode,
    }));

    apiClient
      .get('/auth/me')
      .then((me) => {
        setForm((prev) => ({
          ...prev,
          name: me?.name || prev.name,
          mobile: digitsOnly(me?.phone || '').slice(-10) || prev.mobile,
          email: me?.email?.includes('@mobile.') ? prev.email : me?.email || prev.email,
          line1: me?.address_line1 || prev.line1,
          line2: me?.address_line2 || prev.line2,
          landmark: me?.address_landmark || prev.landmark,
          city: me?.address_city || prev.city,
          state: me?.address_state || prev.state,
          pincode: me?.address_pincode || prev.pincode,
        }));
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));

    paymentService
      .getConfig()
      .then(setPaymentConfig)
      .catch(() => setPaymentConfig({ configured: false }));
  }, [router]);

  useEffect(() => {
    if (paymentFailed) {
      toast.error(
        failReason
          ? `Payment failed (${failReason}). You can try again.`
          : 'Payment failed. You can try again.'
      );
    }
  }, [paymentFailed, failReason]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchShipping = useCallback(async () => {
    if (!hydrated || items.length === 0) return;
    const pin = digitsOnly(form.pincode);
    if (pin.length !== 6 && !form.state) {
      setShippingCharge(null);
      return;
    }

    try {
      setShippingLoading(true);
      const quote = await shippingService.quote({
        subtotal: totalAmount,
        state: form.state || undefined,
        pincode: pin.length === 6 ? pin : undefined,
        payment_method: paymentMethod === 'cod' ? 'cod' : 'prepaid',
      });
      setShippingCharge(
        Number(
          paymentMethod === 'cod'
            ? quote.cod_shipping_charge ?? quote.shipping_charge
            : quote.prepaid_shipping_charge ?? quote.shipping_charge
        ) || 0
      );
      setBaseShippingCharge(
        Number(
          paymentMethod === 'cod'
            ? quote.cod_shipping_charge ?? quote.shipping_charge
            : quote.prepaid_shipping_charge ?? quote.shipping_charge
        ) || 0
      );
    } catch {
      setShippingCharge(null);
      setBaseShippingCharge(null);
    } finally {
      setShippingLoading(false);
    }
  }, [hydrated, items.length, form.pincode, form.state, totalAmount, paymentMethod]);

  useEffect(() => {
    if (!appliedPromo) return;
    if (appliedPromo.action_type === 'free_shipping') {
      setShippingCharge(0);
      return;
    }
    if (baseShippingCharge != null) {
      setShippingCharge(baseShippingCharge);
    }
  }, [appliedPromo, baseShippingCharge]);

  useEffect(() => {
    // Re-validate applied promo when cart/shipping changes
    if (!appliedPromo?.code) return undefined;
    let cancelled = false;
    promoService
      .validate({
        code: appliedPromo.code,
        subtotal: totalAmount,
        shipping_charge: baseShippingCharge ?? 0,
        phone: digitsOnly(form.mobile),
      })
      .then((data) => {
        if (cancelled) return;
        setAppliedPromo(data);
        if (data.action_type === 'free_shipping') {
          setShippingCharge(0);
        } else if (typeof data.shipping_charge === 'number') {
          setShippingCharge(data.shipping_charge);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAppliedPromo(null);
        toast.error('Promo code is no longer valid');
      });
    return () => {
      cancelled = true;
    };
  }, [totalAmount, baseShippingCharge, form.mobile, appliedPromo?.code]);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (code.length < 2) {
      toast.error('Enter a promo code');
      return;
    }
    try {
      setPromoApplying(true);
      const data = await promoService.validate({
        code,
        subtotal: totalAmount,
        shipping_charge: baseShippingCharge ?? shippingCharge ?? 0,
        phone: digitsOnly(form.mobile),
      });
      setAppliedPromo(data);
      setPromoCode(data.code || code);
      if (data.action_type === 'free_shipping') {
        setShippingCharge(0);
      } else if (typeof data.shipping_charge === 'number') {
        setShippingCharge(data.shipping_charge);
      }
      toast.success(data.message || 'Promo applied');
    } catch (err) {
      setAppliedPromo(null);
      toast.error(err.message || 'Invalid promo code');
    } finally {
      setPromoApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setShowPromoField(false);
    if (baseShippingCharge != null) setShippingCharge(baseShippingCharge);
  };

  useEffect(() => {
    const timer = setTimeout(fetchShipping, 400);
    return () => clearTimeout(timer);
  }, [fetchShipping]);

  useEffect(() => {
    const pin = digitsOnly(form.pincode);
    if (pin.length !== 6) return undefined;

    let cancelled = false;
    shippingService
      .lookupPincode(pin)
      .then((details) => {
        if (cancelled || !details) return;
        setForm((prev) => ({
          ...prev,
          city: details.city || prev.city,
          state: details.state || prev.state,
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [form.pincode]);

  const payableTotal = useMemo(() => {
    const ship = shippingCharge == null ? 0 : shippingCharge;
    const discount = Number(appliedPromo?.discount_amount) || 0;
    return Math.max(0, totalAmount - discount + ship);
  }, [totalAmount, shippingCharge, appliedPromo]);

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return false;
    }
    if (digitsOnly(form.mobile).length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!form.line1.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!form.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!form.state.trim()) {
      toast.error('Please select your state');
      return false;
    }
    if (digitsOnly(form.pincode).length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    customer: {
      name: form.name.trim(),
      mobile: digitsOnly(form.mobile),
      email: form.email.trim() || null,
    },
    address: {
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: digitsOnly(form.pincode),
      country: 'India',
    },
    items: buildCheckoutItems(items),
    promo_code: appliedPromo?.code || promoCode.trim() || null,
  });

  const handleOnlinePay = async () => {
    const payload = buildPayload();
    const data = await paymentService.createOrder(payload);

    if (data.provider === 'payu' && data.payment_url && data.payu) {
      submitPayuForm(data.payment_url, data.payu);
      return;
    }

    if (data.provider === 'razorpay' && data.razorpay_order_id && data.key_id) {
      await loadRazorpayScript();
      setSubmitting(false);
      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: Math.round(Number(data.amount) * 100),
        currency: data.currency || 'INR',
        name: 'Lansdowne',
        description: 'Order payment',
        order_id: data.razorpay_order_id,
        prefill: {
          name: payload.customer.name,
          contact: payload.customer.mobile,
          email: payload.customer.email || undefined,
        },
        handler: async (response) => {
          try {
            const verified = await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            const orderId = verified?.order_id || verified?.order?.order_id || '';
            router.push(orderId ? `/orders?order=${orderId}&payment=success` : '/orders?payment=success');
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
      });
      rzp.open();
      return;
    }

    throw new Error('Online payment could not be started. Please try again.');
  };

  const handleCodOrder = async () => {
    const payload = {
      ...buildPayload(),
      payment_method: 'cod',
    };
    const order = await orderService.createCodOrder(payload);
    clearCart();
    const orderId = order?.order_id || order?.id || '';
    router.push(orderId ? `/orders?order=${orderId}&payment=cod` : '/orders?payment=cod');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    if (paymentMethod === 'prepaid' && !paymentConfig?.configured) {
      toast.error('Online payment is not configured yet. Please choose Cash on Delivery.');
      return;
    }

    try {
      setSubmitting(true);
      if (paymentMethod === 'cod') {
        await handleCodOrder();
      } else {
        await handleOnlinePay();
      }
    } catch (err) {
      toast.error(err.message || 'Could not place order');
      setSubmitting(false);
    }
  };

  if (!hydrated || !authChecked) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.inner}>
            <p className={styles.loadingText}>Preparing checkout…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.inner}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.sectionTitle}>CHECKOUT</h1>
              <p className={styles.sectionSubtitle}>Your bag is empty</p>
            </div>
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>Nothing to checkout</h2>
              <p className={styles.emptyDesc}>Add products to your cart before placing an order.</p>
              <ShopNowButton href="/shop" variant="onLight" text="Continue Shopping" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>CHECKOUT</h1>
            <p className={styles.sectionSubtitle}>
              {totalItems} item{totalItems === 1 ? '' : 's'} · Secure order
            </p>
          </div>

          <form className={styles.layout} onSubmit={handlePlaceOrder}>
            <div className={styles.formsColumn}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Contact details</h2>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-name">
                      Full Name
                    </label>
                    <input
                      id="co-name"
                      className={styles.input}
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-mobile">
                      Mobile Number
                    </label>
                    <div className={styles.phoneRow}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        id="co-mobile"
                        className={`${styles.input} ${styles.phoneInput}`}
                        inputMode="numeric"
                        value={form.mobile}
                        onChange={(e) =>
                          updateField('mobile', digitsOnly(e.target.value).slice(0, 10))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="co-email">
                      Email <span className={styles.optional}>(optional)</span>
                    </label>
                    <input
                      id="co-email"
                      type="email"
                      className={styles.input}
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Shipping address</h2>
                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="co-line1">
                      Address Line 1
                    </label>
                    <input
                      id="co-line1"
                      className={styles.input}
                      value={form.line1}
                      onChange={(e) => updateField('line1', e.target.value)}
                      placeholder="House no., street, area"
                      required
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="co-line2">
                      Address Line 2 <span className={styles.optional}>(optional)</span>
                    </label>
                    <input
                      id="co-line2"
                      className={styles.input}
                      value={form.line2}
                      onChange={(e) => updateField('line2', e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-landmark">
                      Landmark <span className={styles.optional}>(optional)</span>
                    </label>
                    <input
                      id="co-landmark"
                      className={styles.input}
                      value={form.landmark}
                      onChange={(e) => updateField('landmark', e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-pincode">
                      Pincode
                    </label>
                    <input
                      id="co-pincode"
                      className={styles.input}
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={(e) =>
                        updateField('pincode', digitsOnly(e.target.value).slice(0, 6))
                      }
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-city">
                      City
                    </label>
                    <input
                      id="co-city"
                      className={styles.input}
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-state">
                      State
                    </label>
                    <select
                      id="co-state"
                      className={styles.input}
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      required
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Payment method</h2>
                <div className={styles.payOptions}>
                  <label
                    className={`${styles.payOption} ${
                      paymentMethod === 'prepaid' ? styles.payOptionActive : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'prepaid'}
                      onChange={() => setPaymentMethod('prepaid')}
                    />
                    <span>
                      <strong>Pay Online</strong>
                      <small>
                        {paymentConfig?.configured
                          ? `Secure payment via ${
                              paymentConfig.provider === 'razorpay' ? 'Razorpay' : 'PayU'
                            }`
                          : 'Online gateway not configured yet'}
                      </small>
                    </span>
                  </label>
                  <label
                    className={`${styles.payOption} ${
                      paymentMethod === 'cod' ? styles.payOptionActive : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span>
                      <strong>Cash on Delivery</strong>
                      <small>Pay when your order arrives</small>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            <aside className={styles.summaryPanel}>
              <h2 className={styles.summaryTitle}>Order summary</h2>

              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryThumb}>
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <span>No img</span>
                      )}
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <p className={styles.summaryItemName}>{item.name}</p>
                      <p className={styles.summaryItemMeta}>Qty {item.quantity}</p>
                    </div>
                    <div className={styles.summaryItemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {!showPromoField && !appliedPromo ? (
                <button
                  type="button"
                  className={styles.promoToggle}
                  onClick={() => setShowPromoField(true)}
                >
                  Enter promo code
                </button>
              ) : (
                <>
                  <div className={styles.promoRow}>
                    <input
                      className={styles.input}
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={Boolean(appliedPromo)}
                      autoFocus={showPromoField && !appliedPromo}
                    />
                    {appliedPromo ? (
                      <button type="button" className={styles.promoBtn} onClick={handleRemovePromo}>
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.promoBtn}
                        onClick={handleApplyPromo}
                        disabled={promoApplying}
                      >
                        {promoApplying ? '…' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedPromo && (
                    <p className={styles.promoApplied}>
                      {appliedPromo.message || 'Promo applied'}
                    </p>
                  )}
                </>
              )}

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              {appliedPromo?.discount_amount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(appliedPromo.discount_amount)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>
                  {shippingLoading
                    ? 'Calculating…'
                    : shippingCharge == null
                      ? 'Enter pincode'
                      : shippingCharge === 0
                        ? 'Free'
                        : formatPrice(shippingCharge)}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>{formatPrice(payableTotal)}</span>
              </div>

              <ShopNowButton
                as="button"
                type="submit"
                text={
                  submitting
                    ? 'Please wait…'
                    : paymentMethod === 'cod'
                      ? 'Place COD Order'
                      : 'Pay Securely'
                }
                variant="onLight"
                fullWidth
                disabled={submitting}
                showArrow={!submitting}
              />

              <Link href="/cart" className={styles.backLink}>
                ← Back to cart
              </Link>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
