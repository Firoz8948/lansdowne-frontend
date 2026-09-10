'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import styles from '../home.module.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to Lansdowne VIP!');
    setEmail('');
  };

  return (
    <div className={styles.newsletterCard}>
      <h2 className={styles.newsletterTitle}>Join the Lansdowne VIP Circle</h2>
      <p className={styles.newsletterSubtitle}>
        Receive private product drop alerts, member-only discounts, and artisanal insights.
      </p>

      <form className={styles.newsletterForm} onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className={styles.newsletterInput}
          required
        />
        <button type="submit" className={styles.newsletterBtn}>
          Subscribe
        </button>
      </form>
    </div>
  );
}
