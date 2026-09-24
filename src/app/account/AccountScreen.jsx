'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Pencil, LogOut } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ShopNowButton from '@/components/ShopNowButton';
import authService from '@/lib/services/auth';
import orderService from '@/lib/services/orders';
import { INDIAN_STATES, formatPrice, digitsOnly, formatVariantLabel } from '@/app/checkout/checkoutUtils';
import styles from './account.module.css';

function displayEmail(email) {
  if (!email || String(email).includes('@mobile.')) return '';
  return email;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusLabel(status) {
  if (!status) return '—';
  return String(status).replace(/_/g, ' ');
}

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  address_line1: '',
  address_line2: '',
  address_landmark: '',
  address_city: '',
  address_state: '',
  address_pincode: '',
};

export default function AccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [form, setForm] = useState(emptyProfile);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const load = useCallback(async () => {
    if (!authService.isLoggedIn()) {
      router.replace('/account/login?next=/account');
      return;
    }

    try {
      setLoading(true);
      const me = await authService.getProfile();
      setForm({
        name: me?.name || '',
        email: displayEmail(me?.email),
        phone: digitsOnly(me?.phone || '').slice(-10),
        date_of_birth: me?.date_of_birth ? String(me.date_of_birth).slice(0, 10) : '',
        address_line1: me?.address_line1 || '',
        address_line2: me?.address_line2 || '',
        address_landmark: me?.address_landmark || '',
        address_city: me?.address_city || '',
        address_state: me?.address_state || '',
        address_pincode: me?.address_pincode || '',
      });
    } catch {
      authService.logout();
      router.replace('/account/login?next=/account');
      return;
    } finally {
      setLoading(false);
    }

    try {
      setOrdersLoading(true);
      const data = await orderService.myOrders();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async ({ closeName = false, closeDetails = false } = {}) => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    try {
      setSavingProfile(true);
      await authService.updateProfile({
        name: form.name.trim(),
        email: form.email.trim() || '',
        date_of_birth: form.date_of_birth || '',
      });
      toast.success('Profile updated');
      if (closeName) setEditingName(false);
      if (closeDetails) setEditingDetails(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAddress = async () => {
    if (form.address_pincode && digitsOnly(form.address_pincode).length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    try {
      setSavingAddress(true);
      await authService.updateProfile({
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim(),
        address_landmark: form.address_landmark.trim(),
        address_city: form.address_city.trim(),
        address_state: form.address_state.trim(),
        address_pincode: digitsOnly(form.address_pincode),
      });
      toast.success('Address saved');
      setEditingAddress(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSignOut = () => {
    authService.logout();
    toast.success('Signed out');
    router.replace('/account/login');
  };

  const addressPreview = [
    form.address_line1,
    form.address_line2,
    form.address_landmark,
    [form.address_city, form.address_state].filter(Boolean).join(', '),
    form.address_pincode,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>My Account</h1>
            <p className={styles.sectionSubtitle}>
              Profile, saved address, and your orders
            </p>
          </div>

          {loading ? (
            <p className={styles.loadingText}>Loading your account…</p>
          ) : (
            <div className={styles.layout}>
              <div className={styles.formsColumn}>
                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Profile</h2>
                    <button
                      type="button"
                      className={styles.iconAction}
                      onClick={handleSignOut}
                      aria-label="Sign out"
                    >
                      <LogOut size={16} strokeWidth={1.75} />
                      Sign out
                    </button>
                  </div>

                  <div className={styles.nameRow}>
                    {editingName ? (
                      <div className={styles.nameEdit}>
                        <input
                          className={styles.input}
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          autoFocus
                          placeholder="Your name"
                        />
                        <div className={styles.inlineActions}>
                          <button
                            type="button"
                            className={styles.primaryBtn}
                            disabled={savingProfile}
                            onClick={() => saveProfile({ closeName: true })}
                          >
                            {savingProfile ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className={styles.textBtn}
                            onClick={() => setEditingName(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className={styles.displayName}>
                          {form.name || 'Add your name'}
                        </h3>
                        <button
                          type="button"
                          className={styles.editIconBtn}
                          aria-label="Edit name"
                          onClick={() => setEditingName(true)}
                        >
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                      </>
                    )}
                  </div>

                  <dl className={styles.metaList}>
                    <div className={styles.metaRow}>
                      <dt>Mobile</dt>
                      <dd>+91 {form.phone || '—'}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Email</dt>
                      <dd>{form.email || 'Not added'}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Date of birth</dt>
                      <dd>
                        {form.date_of_birth
                          ? formatDate(form.date_of_birth)
                          : 'Not added'}
                      </dd>
                    </div>
                  </dl>

                  {editingDetails ? (
                    <div className={styles.editGrid}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-email">
                          Email
                        </label>
                        <input
                          id="acc-email"
                          type="email"
                          className={styles.input}
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-dob">
                          Date of birth
                        </label>
                        <input
                          id="acc-dob"
                          type="date"
                          className={styles.input}
                          value={form.date_of_birth}
                          onChange={(e) => updateField('date_of_birth', e.target.value)}
                        />
                      </div>
                      <div className={styles.inlineActions}>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          disabled={savingProfile}
                          onClick={() => saveProfile({ closeDetails: true })}
                        >
                          {savingProfile ? 'Saving…' : 'Save details'}
                        </button>
                        <button
                          type="button"
                          className={styles.textBtn}
                          onClick={() => setEditingDetails(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setEditingDetails(true)}
                    >
                      Edit email &amp; date of birth
                    </button>
                  )}
                </section>

                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Delivery address</h2>
                    {!editingAddress && (
                      <button
                        type="button"
                        className={styles.editIconBtn}
                        aria-label="Edit address"
                        onClick={() => setEditingAddress(true)}
                      >
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                  <p className={styles.cardHint}>
                    Saved here for faster checkout. Placing an order also updates this
                    address.
                  </p>

                  {editingAddress ? (
                    <div className={styles.editGrid}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-line1">
                          Address line 1
                        </label>
                        <input
                          id="acc-line1"
                          className={styles.input}
                          value={form.address_line1}
                          onChange={(e) => updateField('address_line1', e.target.value)}
                          placeholder="House / street"
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-line2">
                          Address line 2
                        </label>
                        <input
                          id="acc-line2"
                          className={styles.input}
                          value={form.address_line2}
                          onChange={(e) => updateField('address_line2', e.target.value)}
                          placeholder="Apartment, floor (optional)"
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-landmark">
                          Landmark
                        </label>
                        <input
                          id="acc-landmark"
                          className={styles.input}
                          value={form.address_landmark}
                          onChange={(e) =>
                            updateField('address_landmark', e.target.value)
                          }
                          placeholder="Nearby landmark (optional)"
                        />
                      </div>
                      <div className={styles.fieldRow}>
                        <div className={styles.field}>
                          <label className={styles.label} htmlFor="acc-city">
                            City
                          </label>
                          <input
                            id="acc-city"
                            className={styles.input}
                            value={form.address_city}
                            onChange={(e) => updateField('address_city', e.target.value)}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label} htmlFor="acc-state">
                            State
                          </label>
                          <select
                            id="acc-state"
                            className={styles.input}
                            value={form.address_state}
                            onChange={(e) =>
                              updateField('address_state', e.target.value)
                            }
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
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="acc-pin">
                          Pincode
                        </label>
                        <input
                          id="acc-pin"
                          className={styles.input}
                          value={form.address_pincode}
                          onChange={(e) =>
                            updateField(
                              'address_pincode',
                              digitsOnly(e.target.value).slice(0, 6)
                            )
                          }
                          inputMode="numeric"
                          placeholder="6-digit pincode"
                        />
                      </div>
                      <div className={styles.inlineActions}>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          disabled={savingAddress}
                          onClick={saveAddress}
                        >
                          {savingAddress ? 'Saving…' : 'Save address'}
                        </button>
                        <button
                          type="button"
                          className={styles.textBtn}
                          onClick={() => setEditingAddress(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : addressPreview ? (
                    <p className={styles.addressBlock}>{addressPreview}</p>
                  ) : (
                    <p className={styles.emptyHint}>No address saved yet.</p>
                  )}
                </section>
              </div>

              <aside className={styles.ordersColumn}>
                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>My orders</h2>
                  </div>

                  {ordersLoading ? (
                    <p className={styles.emptyHint}>Loading orders…</p>
                  ) : orders.length === 0 ? (
                    <div className={styles.emptyOrders}>
                      <p className={styles.emptyHint}>You haven&apos;t placed an order yet.</p>
                      <ShopNowButton href="/shop" variant="onLight">
                        Shop now
                      </ShopNowButton>
                    </div>
                  ) : (
                    <ul className={styles.orderList}>
                      {orders.map((order) => (
                        <li key={order.order_id || order.id} className={styles.orderItem}>
                          <div className={styles.orderTop}>
                            <span className={styles.orderId}>
                              #{order.order_id || order.id}
                            </span>
                            <span className={styles.orderStatus}>
                              {statusLabel(order.order_status)}
                            </span>
                          </div>
                          <div className={styles.orderMeta}>
                            <span>{formatDate(order.created_at)}</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                          {order.items?.length > 0 && (
                            <p className={styles.orderItems}>
                              {order.items
                                .map((item) => {
                                  const variantText = formatVariantLabel(item);
                                  return `${item.name}${
                                    variantText ? ` (${variantText})` : ''
                                  } × ${item.quantity}`;
                                })
                                .join(', ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className={styles.sideActions}>
                  <Link href="/shop" className={styles.secondaryBtn}>
                    Continue shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
