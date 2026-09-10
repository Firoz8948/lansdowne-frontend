import styles from './faqs.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Frequently Asked Questions | Lansdowne',
  description: 'Find answers to common questions about orders, shipping, and products',
};

export default function FAQsPage() {
  const faqs = [
    {
      q: 'How do I track my order?',
      a: 'Once your order is shipped, you will receive an SMS and email notification with tracking details.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI, Net Banking, and Cash on Delivery.',
    },
    {
      q: 'What is your return/exchange policy?',
      a: 'We offer an easy return and exchange policy within 7 days of delivery for eligible items.',
    },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Have questions? Here are quick answers to the most common inquiries.
        </p>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h2 className={styles.question}>{faq.q}</h2>
              <p className={styles.answer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
