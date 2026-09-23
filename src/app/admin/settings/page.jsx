'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, Settings } from 'lucide-react';
import adminService from '@/lib/services/admin';
import productStyles from '../products/products.module.css';
import styles from './settings.module.css';

const DEFAULTS = {
  brand_name: 'Lansdowne Leather',
  phone: '8979543500',
  email: 'lansdowneleather1@gmail.com',
  locked: true,
  otp_enabled: false,
  order_sms_enabled: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await adminService.getBrandSettings();
        if (mounted && data) {
          setSettings({ ...DEFAULTS, ...data, locked: true });
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load settings');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={productStyles.container}>
      <div className={productStyles.header}>
        <div>
          <h1 className={productStyles.title}>Settings</h1>
          <p className={productStyles.subtitle}>
            Brand identity and order notification contacts (locked)
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <Settings size={18} />
          <span>Store notifications</span>
          <span className={styles.lockBadge}>
            <Lock size={12} />
            Locked
          </span>
        </div>

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : (
          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.label}>Brand name</span>
              <input
                className={styles.input}
                value={settings.brand_name || ''}
                readOnly
                disabled
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Mobile number</span>
              <input
                className={styles.input}
                value={settings.phone || ''}
                readOnly
                disabled
              />
              <span className={styles.hint}>
                New order SMS (Renflair V4) is sent to this number
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email ID</span>
              <input
                className={styles.input}
                value={settings.email || ''}
                readOnly
                disabled
              />
            </label>

            <div className={styles.statusRow}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Customer OTP (V1)</span>
                <span
                  className={
                    settings.otp_enabled ? styles.statusOn : styles.statusOff
                  }
                >
                  {settings.otp_enabled ? 'Active' : 'Check RENFLAIR + OTP_DEBUG=false'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Order SMS (V3 / V4)</span>
                <span
                  className={
                    settings.order_sms_enabled ? styles.statusOn : styles.statusOff
                  }
                >
                  {settings.order_sms_enabled ? 'Active' : 'Set RENFLAIR_API_KEY'}
                </span>
              </div>
            </div>

            <p className={styles.note}>
              These values are managed on the server (
              <code>BRAND_NAME</code>, <code>ADMIN_NOTIFY_PHONE</code>,{' '}
              <code>ADMIN_NOTIFY_EMAIL</code>) and cannot be edited here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
