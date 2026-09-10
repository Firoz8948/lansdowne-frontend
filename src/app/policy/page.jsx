import Link from 'next/link';
import styles from './policy.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: 'Legal & Store Policies | Lansdowne',
  description: 'View all legal and compliance policies',
};

export default function PolicyIndexPage() {
  const policies = [
    {
      title: 'Privacy Policy',
      desc: 'How we collect, protect, and use your personal information and data.',
      href: '/policy/privacy-policy',
    },
    {
      title: 'Terms and Conditions',
      desc: 'General terms of website use, account obligations, and transactions.',
      href: '/policy/terms-and-conditions',
    },
    {
      title: 'Refund & Return Policy',
      desc: 'Our return process, refund timelines, and exchange eligibility.',
      href: '/policy/refund-policy',
    },
    {
      title: 'Shipping Policy',
      desc: 'Estimated delivery timelines, shipping charges, and tracking methods.',
      href: '/policy/shipping-policy',
    },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Legal & Store Policies</h1>
        <p className={styles.subtitle}>
          Read our store policies and compliance terms for shopping at Lansdowne.
        </p>

        <div className={styles.grid}>
          {policies.map((p, idx) => (
            <Link key={idx} href={p.href} className={styles.card}>
              <div>
                <h2 className={styles.cardTitle}>{p.title}</h2>
                <p className={styles.cardDesc}>{p.desc}</p>
              </div>
              <span className={styles.cardLink}>Read Policy →</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
