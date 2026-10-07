import styles from './contact.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import ContactForm from './ContactForm';

export const metadata = pageMetadata({
  title: 'Contact Us | Lansdowne Leather',
  description:
    'Get in touch with the Lansdowne Leather team for orders, returns or product questions. Reach us via email, phone, or send us a message directly.',
  path: '/contact-us',
});

const contactInfo = [
  {
    icon: Mail,
    label: 'Email Support',
    value: 'lansdowneleather1@gmail.com',
    href: 'mailto:lansdowneleather1@gmail.com',
    extra: 'We typically respond within 24 hours',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+91 89795 43500',
    href: 'tel:+918979543500',
    extra: 'Call or WhatsApp during business hours',
  },
  {
    icon: Clock,
    label: 'Operating Hours',
    value: 'Mon – Sat: 10:00 AM – 7:00 PM IST',
    extra: 'Closed on Sundays and national holidays',
  },
  {
    icon: MapPin,
    label: 'Business Address',
    value: 'JBS and Co (Lansdowne Leather)',
    extra: 'Sadar Bazaar, Lansdowne, Uttarakhand 246155, India',
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
                  <span className={styles.infoValue}>
                    {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                  </span>
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
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
