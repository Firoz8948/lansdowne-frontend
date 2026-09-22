import styles from './shipping.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';

export const metadata = {
  title: 'Shipping Policy | Lansdowne',
  description:
    'Everything you need to know about Lansdowne\'s shipping timelines, charges, tracking, and delivery coverage across India.',
};

export default function ShippingPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Shipping Policy"
        subtitle="Last updated: September 2026"
        backLabel="Back to Home"
        backHref="/"
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Order Processing & Dispatch</h2>
          <p className={styles.paragraph}>
            All orders are verified and processed within 24–48 business hours from the time of order confirmation. Orders placed on weekends or national holidays will be processed on the next working day. You will receive an email and SMS notification once your order has been dispatched.
          </p>
          <div className={styles.highlightBox}>
            <p>Business hours: Monday to Saturday, 10:00 AM – 7:00 PM IST. Orders placed after 5:00 PM may be processed the next business day.</p>
          </div>

          <h2 className={styles.sectionHeading}>2. Estimated Delivery Timelines</h2>
          <p className={styles.paragraph}>
            Delivery timelines vary depending on your location. Below are estimated delivery windows from the date of dispatch:
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Estimated Delivery</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Metro cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata)</td>
                <td>3–5 business days</td>
              </tr>
              <tr>
                <td>Tier-2 cities (Jaipur, Lucknow, Pune, Ahmedabad, Chandigarh, etc.)</td>
                <td>4–6 business days</td>
              </tr>
              <tr>
                <td>Tier-3 cities & rural areas</td>
                <td>5–8 business days</td>
              </tr>
              <tr>
                <td>North-East India & remote locations</td>
                <td>7–10 business days</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.paragraph}>
            Please note that delivery timelines are estimates and may vary due to factors beyond our control, including weather conditions, courier partner logistics, and local restrictions.
          </p>

          <h2 className={styles.sectionHeading}>3. Shipping Charges</h2>
          <p className={styles.paragraph}>
            We strive to keep shipping as affordable as possible:
          </p>
          <ul className={styles.list}>
            <li><strong>Free shipping</strong> on all prepaid orders above ₹999</li>
            <li><strong>₹79 flat rate</strong> for prepaid orders below ₹999</li>
            <li><strong>₹79 shipping + ₹49 COD handling fee</strong> for Cash on Delivery orders</li>
          </ul>
          <p className={styles.paragraph}>
            Promotional free shipping offers may be available from time to time and will be communicated on our website and social media channels.
          </p>

          <h2 className={styles.sectionHeading}>4. Order Tracking</h2>
          <p className={styles.paragraph}>
            Once your order is dispatched, you will receive a tracking link via SMS and email. You can use this link to monitor your shipment in real time through our courier partner's website. If you do not receive tracking information within 48 hours of dispatch, please contact our support team at <strong>support@lansdowne.in</strong>.
          </p>

          <h2 className={styles.sectionHeading}>5. Undeliverable Orders</h2>
          <p className={styles.paragraph}>
            If a delivery attempt fails due to an incorrect address, recipient unavailability, or refusal to accept the parcel, our courier partner will make up to 2 additional delivery attempts. If the order remains undelivered after 3 attempts, it will be returned to our warehouse. In such cases:
          </p>
          <ul className={styles.list}>
            <li>For prepaid orders — a full refund will be initiated to your original payment method after deducting return shipping charges</li>
            <li>For COD orders — no charges will be applicable</li>
          </ul>

          <h2 className={styles.sectionHeading}>6. Serviceable Areas</h2>
          <p className={styles.paragraph}>
            We currently ship to all serviceable pin codes within India. You can check delivery availability and estimated timelines by entering your pin code during checkout. We do not offer international shipping at this time.
          </p>

          <h2 className={styles.sectionHeading}>7. Contact Us</h2>
          <p className={styles.paragraph}>
            For any shipping-related queries or concerns, please reach out to us:
          </p>
          <ul className={styles.list}>
            <li><strong>Email:</strong> support@lansdowne.in</li>
            <li><strong>Phone:</strong> +91 98765 43210</li>
            <li><strong>Hours:</strong> Mon – Sat, 10:00 AM – 7:00 PM IST</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
