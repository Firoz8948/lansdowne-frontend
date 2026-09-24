import styles from './privacy.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';

export const metadata = {
  title: 'Privacy Policy | Lansdowne',
  description:
    'Learn how Lansdowne collects, uses, and protects your personal information when you shop with us.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Privacy Policy"
        subtitle="Last updated: September 2026"
        backLabel="Back to Home"
        backHref="/"
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Information We Collect</h2>
          <p className={styles.paragraph}>
            When you visit our website or place an order, we may collect the following types of personal information:
          </p>
          <ul className={styles.list}>
            <li>Full name, email address, phone number, and shipping/billing address</li>
            <li>Payment information (processed securely through our payment gateway — we do not store card details)</li>
            <li>Order history, product preferences, and browsing behaviour on our website</li>
            <li>Device information, IP address, browser type, and cookies (see Section 3)</li>
            <li>Any information you voluntarily provide through support enquiries or feedback forms</li>
          </ul>

          <h2 className={styles.sectionHeading}>2. How We Use Your Information</h2>
          <p className={styles.paragraph}>
            The information we collect is used solely for the following purposes:
          </p>
          <ul className={styles.list}>
            <li>Processing and fulfilling your orders, including dispatch, delivery, and payment verification</li>
            <li>Sending order confirmations, shipping updates, and tracking notifications via SMS and email</li>
            <li>Providing customer support and responding to your enquiries or complaints</li>
            <li>Improving our website experience, product offerings, and marketing communications</li>
            <li>Complying with legal obligations and preventing fraudulent transactions</li>
          </ul>

          <h2 className={styles.sectionHeading}>3. Cookies & Tracking Technologies</h2>
          <p className={styles.paragraph}>
            Our website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences, analyse website traffic, and serve relevant content. You can manage or disable cookies through your browser settings; however, some features of the website may not function optimally without them.
          </p>

          <h2 className={styles.sectionHeading}>4. Data Sharing & Disclosure</h2>
          <p className={styles.paragraph}>
            We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers only when necessary:
          </p>
          <ul className={styles.list}>
            <li><strong>Logistics partners</strong> — to fulfil and deliver your orders</li>
            <li><strong>Payment gateways</strong> — to securely process transactions</li>
            <li><strong>Analytics providers</strong> — to understand website usage patterns (anonymised data)</li>
            <li><strong>Legal authorities</strong> — if required by law, court order, or government regulation</li>
          </ul>
          <p className={styles.paragraph}>
            All third-party partners are contractually obligated to handle your data securely and only for the purposes specified.
          </p>

          <h2 className={styles.sectionHeading}>5. Data Security</h2>
          <p className={styles.paragraph}>
            We implement industry-standard security measures to protect your personal information, including 256-bit SSL encryption for all data transmitted through our website, secure server infrastructure, and restricted access controls. While no method of electronic storage or transmission is 100% secure, we continuously review and update our security practices to safeguard your data.
          </p>

          <h2 className={styles.sectionHeading}>6. Third-Party Links</h2>
          <p className={styles.paragraph}>
            Our website may contain links to third-party websites or services that are not operated by Lansdowne. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party site you visit.
          </p>

          <h2 className={styles.sectionHeading}>7. Your Rights</h2>
          <p className={styles.paragraph}>
            You have the right to:
          </p>
          <ul className={styles.list}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of inaccurate or outdated information</li>
            <li>Opt out of marketing communications at any time by clicking the "Unsubscribe" link in our emails</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
          <p className={styles.paragraph}>
            To exercise any of these rights, please contact us at <strong>lansdowneleather1@gmail.com</strong>.
          </p>

          <h2 className={styles.sectionHeading}>8. Policy Updates</h2>
          <p className={styles.paragraph}>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any significant changes will be communicated through our website or via email. We encourage you to review this page periodically.
          </p>

          <div className={styles.highlightBox}>
            <p>If you have any questions about this Privacy Policy, please contact us at <strong>lansdowneleather1@gmail.com</strong> or call <strong>+91 89795 43500</strong>.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
