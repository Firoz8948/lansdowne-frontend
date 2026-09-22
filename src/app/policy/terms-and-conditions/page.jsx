import styles from './terms.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';

export const metadata = {
  title: 'Terms & Conditions | Lansdowne',
  description:
    'Read the terms and conditions governing your use of the Lansdowne website and purchases.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Terms & Conditions"
        subtitle="Last updated: September 2026"
        backLabel="Back to Home"
        backHref="/"
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            By accessing, browsing, or purchasing from the Lansdowne website (lansdowne.in), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please refrain from using our website or services.
          </p>

          <h2 className={styles.sectionHeading}>2. Eligibility</h2>
          <p className={styles.paragraph}>
            You must be at least 18 years of age to make a purchase on our website. By placing an order, you represent and warrant that you meet this age requirement and that all information you provide is accurate and complete.
          </p>

          <h2 className={styles.sectionHeading}>3. Account Responsibilities</h2>
          <p className={styles.paragraph}>
            If you create an account on our website, you are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorised access to your account. Lansdowne is not liable for any loss or damage arising from your failure to safeguard your account information.
          </p>

          <h2 className={styles.sectionHeading}>4. Products & Pricing</h2>
          <p className={styles.paragraph}>
            We make every effort to display product descriptions, images, and pricing as accurately as possible. However, we do not warrant that product specifications, images, or prices are free from errors. All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.
          </p>
          <p className={styles.paragraph}>
            Lansdowne reserves the right to modify product pricing, discontinue products, or correct any errors at any time without prior notice. In the event of a pricing error after your order has been placed, we will notify you and offer the option to proceed at the correct price or cancel the order.
          </p>

          <h2 className={styles.sectionHeading}>5. Orders & Cancellations</h2>
          <p className={styles.paragraph}>
            Placing an order on our website constitutes an offer to purchase. We reserve the right to accept or decline your order at our sole discretion. Orders may be cancelled if the product is out of stock, payment cannot be verified, or if we detect suspicious or fraudulent activity.
          </p>
          <p className={styles.paragraph}>
            You may cancel an order before it has been dispatched by contacting our support team. Once an order is shipped, it cannot be cancelled but may be returned as per our Return & Refund Policy.
          </p>

          <h2 className={styles.sectionHeading}>6. Payment Terms</h2>
          <p className={styles.paragraph}>
            All payments are processed through secure, PCI-DSS compliant payment gateways. We accept credit/debit cards, UPI, net banking, and Cash on Delivery. Full payment must be received before dispatch for prepaid orders. Lansdowne does not store your card or banking details on its servers.
          </p>

          <h2 className={styles.sectionHeading}>7. Intellectual Property</h2>
          <p className={styles.paragraph}>
            All content on the Lansdowne website — including but not limited to text, graphics, logos, images, product photographs, and software — is the property of Lansdowne Lifestyle Pvt. Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our prior written consent.
          </p>

          <h2 className={styles.sectionHeading}>8. Limitation of Liability</h2>
          <p className={styles.paragraph}>
            To the fullest extent permitted by law, Lansdowne shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability for any claim related to a purchase shall not exceed the purchase price of the product in question.
          </p>

          <h2 className={styles.sectionHeading}>9. Governing Law & Jurisdiction</h2>
          <p className={styles.paragraph}>
            These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
          </p>

          <h2 className={styles.sectionHeading}>10. Contact Information</h2>
          <p className={styles.paragraph}>
            For any questions or concerns regarding these Terms and Conditions, please reach out to us:
          </p>
          <ul className={styles.list}>
            <li><strong>Email:</strong> support@lansdowne.in</li>
            <li><strong>Phone:</strong> +91 98765 43210</li>
            <li><strong>Address:</strong> Lansdowne Lifestyle Pvt. Ltd., New Delhi, India — 110001</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
