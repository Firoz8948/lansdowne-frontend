import styles from './contact.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Lansdowne',
  description:
    'Get in touch with the Lansdowne team. Reach us via email, phone, or send us a message directly.',
};

const contactInfo = [
  {
    icon: Mail,
    label: 'Email Support',
    value: 'lansdowneleather1@gmail.com',
    extra: 'We typically respond within 24 hours',
  },
  {
    icon: Phone,
    label: 'Customer Helpline',
    value: '+91 89795 43500',
    extra: 'Available during business hours',
  },
  {
    icon: Clock,
    label: 'Operating Hours',
    value: 'Mon – Sat: 10:00 AM – 7:00 PM IST',
    extra: 'Closed on Sundays and national holidays',
  },
  {
    icon: MapPin,
    label: 'Registered Office',
    value: 'JBS and Co',
    extra: 'Sadar Bazaar, Lansdowne, Uttarakhand, 246155',
  },
];

export default function ContactUsPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Contact Us"
        subtitle="We'd love to hear from you. Send us a message or reach out via our support channels."
      />

      <main className={styles.main}>
        {/* ── Contact Info Cards ── */}
        <section className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>GET IN TOUCH</h2>
            <p className={styles.sectionSubtitle}>Ways to Reach Us</p>
          </div>
          <div className={styles.infoGrid}>
            {contactInfo.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <IconComp size={22} strokeWidth={1.5} />
                  </div>
                  <span className={styles.infoLabel}>{item.label}</span>
                  <span className={styles.infoValue}>{item.value}</span>
                  <span className={styles.infoExtra}>{item.extra}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Contact Form ── */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SEND US A MESSAGE</h2>
            <p className={styles.sectionSubtitle}>Let Us Know</p>
          </div>

          <div className={styles.formCard}>
            <form className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Subject</label>
                  <input
                    type="text"
                    placeholder="Order enquiry, feedback, etc."
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                  placeholder="Tell us how we can help you…"
                  className={styles.textarea}
                />
              </div>
              <button type="button" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
