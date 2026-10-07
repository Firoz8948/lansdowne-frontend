'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './contact.module.css';

const WHATSAPP_NUMBER = '918979543500';
const SUPPORT_EMAIL = 'lansdowneleather1@gmail.com';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const composeBody = () =>
    [
      form.subject && `Subject: ${form.subject}`,
      `Name: ${form.name}`,
      form.email && `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      '',
      form.message,
    ]
      .filter((line) => line !== false && line !== undefined)
      .join('\n');

  const isValid = () => {
    if (form.name.trim().length < 2) {
      toast.error('Please enter your name');
      return false;
    }
    if (form.message.trim().length < 5) {
      toast.error('Please write a short message');
      return false;
    }
    return true;
  };

  const sendWhatsApp = (e) => {
    e.preventDefault();
    if (!isValid()) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(composeBody())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendEmail = () => {
    if (!isValid()) return;
    const subject = form.subject.trim() || 'Website enquiry';
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(composeBody())}`;
  };

  return (
    <form className={styles.form} onSubmit={sendWhatsApp}>
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ct-name">
            Full Name
          </label>
          <input
            id="ct-name"
            type="text"
            placeholder="Enter your full name"
            className={styles.input}
            value={form.name}
            onChange={update('name')}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ct-email">
            Email Address
          </label>
          <input
            id="ct-email"
            type="email"
            placeholder="you@example.com"
            className={styles.input}
            value={form.email}
            onChange={update('email')}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ct-phone">
            Phone Number
          </label>
          <input
            id="ct-phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            className={styles.input}
            value={form.phone}
            onChange={update('phone')}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="ct-subject">
            Subject
          </label>
          <input
            id="ct-subject"
            type="text"
            placeholder="Order enquiry, feedback, etc."
            className={styles.input}
            value={form.subject}
            onChange={update('subject')}
          />
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="ct-message">
          Message
        </label>
        <textarea
          id="ct-message"
          placeholder="Tell us how we can help you…"
          className={styles.textarea}
          value={form.message}
          onChange={update('message')}
          required
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn}>
          Send on WhatsApp
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={sendEmail}>
          Send by Email
        </button>
      </div>
    </form>
  );
}
