import styles from './contact.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Contact Us | Lansdowne',
  description: 'Get in touch with our team',
};

export default function ContactUsPage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          We’d love to hear from you. Send us a message or reach out via our contact channels.
        </p>

        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email Support</span>
              <span className={styles.infoValue}>support@lansdowne.com</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Customer Helpline</span>
              <span className={styles.infoValue}>+91 98765 43210</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Operating Hours</span>
              <span className={styles.infoValue}>Mon - Sat: 9:00 AM - 6:00 PM IST</span>
            </div>
          </div>

          <div className={styles.formCard}>
            <form className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Your Name</label>
                <input type="text" placeholder="Enter your full name" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone / Email</label>
                <input type="text" placeholder="Your contact details" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Message</label>
                <textarea placeholder="How can we help you?" className={styles.textarea} />
              </div>
              <button type="button" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
