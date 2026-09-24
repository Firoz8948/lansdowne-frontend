import styles from './refund.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';

export const metadata = {
  title: 'Returns & Refunds Policy | Lansdowne',
  description:
    'Learn about Lansdowne\'s return eligibility, refund timelines, exchange process, and how to initiate a return.',
};

export default function RefundPolicyPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Returns & Refunds Policy"
        subtitle="Last updated: September 2026"
        backLabel="Back to Home"
        backHref="/"
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <h2 className={styles.sectionHeading}>1. Return Eligibility</h2>
          <p className={styles.paragraph}>
            We want you to be completely satisfied with your purchase. If you are not happy with your order, you may request a return within <strong>7 days</strong> of the delivery date, provided the following conditions are met:
          </p>
          <ul className={styles.list}>
            <li>The product is unused, unworn, and unwashed</li>
            <li>All original tags, labels, and packaging are intact</li>
            <li>The product is in its original condition without any alterations or damage</li>
            <li>Proof of purchase (order confirmation email or invoice) is available</li>
          </ul>

          <h2 className={styles.sectionHeading}>2. Non-Returnable Items</h2>
          <p className={styles.paragraph}>
            The following categories are not eligible for returns or exchanges:
          </p>
          <ul className={styles.list}>
            <li>Innerwear, undergarments, and socks</li>
            <li>Customised or personalised products</li>
            <li>Products purchased during clearance or final sale</li>
            <li>Gift cards and vouchers</li>
            <li>Products with removed or damaged tags</li>
          </ul>

          <h2 className={styles.sectionHeading}>3. How to Initiate a Return</h2>
          <p className={styles.paragraph}>
            Follow these simple steps to request a return:
          </p>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepText}>Contact our support team at <strong>lansdowneleather1@gmail.com</strong> or call <strong>+91 89795 43500</strong> with your order number and reason for return.</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepText}>Our team will review your request and confirm eligibility within 24–48 hours.</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepText}>Once approved, our courier partner will schedule a pickup from your delivery address within 2–3 business days.</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepText}>Pack the product securely in its original packaging and hand it over to the pickup agent.</span>
            </div>
          </div>

          <h2 className={styles.sectionHeading}>4. Refund Processing</h2>
          <p className={styles.paragraph}>
            Once the returned product is received and inspected at our fulfilment centre, we will notify you of the approval or rejection of your refund.
          </p>
          <div className={styles.highlightBox}>
            <p>Approved refunds are initiated within 48 hours of inspection. The amount is credited to your original payment method within 5–7 business days.</p>
          </div>
          <ul className={styles.list}>
            <li><strong>Credit/Debit Card & Net Banking:</strong> Refund credited within 5–7 business days</li>
            <li><strong>UPI:</strong> Refund credited within 2–4 business days</li>
            <li><strong>Cash on Delivery:</strong> Refund transferred to your bank account (NEFT/IMPS) within 7–10 business days</li>
          </ul>
          <p className={styles.paragraph}>
            Please note that shipping charges (if applicable) are non-refundable unless the return is due to a defective or incorrect product.
          </p>

          <h2 className={styles.sectionHeading}>5. Exchanges</h2>
          <p className={styles.paragraph}>
            We offer exchanges for size or colour variants of the same product, subject to stock availability. To request an exchange, contact our support team within the 7-day return window. If the desired variant is unavailable, we will process a refund instead.
          </p>

          <h2 className={styles.sectionHeading}>6. Damaged or Incorrect Products</h2>
          <p className={styles.paragraph}>
            If you receive a product that is damaged, defective, or different from what you ordered, please contact us within <strong>48 hours</strong> of delivery with photographs of the product and packaging. We will arrange a free pickup and send you a replacement or full refund at no additional cost.
          </p>

          <h2 className={styles.sectionHeading}>7. Order Cancellations</h2>
          <p className={styles.paragraph}>
            You may cancel an order anytime before it has been dispatched by contacting our support team. For prepaid orders, the full amount will be refunded to your original payment method within 3–5 business days. Once an order is shipped, cancellation is not possible — you may initiate a return after delivery.
          </p>

          <h2 className={styles.sectionHeading}>8. Contact Us</h2>
          <p className={styles.paragraph}>
            For any return or refund-related queries, please reach out to us:
          </p>
          <ul className={styles.list}>
            <li><strong>Email:</strong> lansdowneleather1@gmail.com</li>
            <li><strong>Phone:</strong> +91 89795 43500</li>
            <li><strong>Hours:</strong> Mon – Sat, 10:00 AM – 7:00 PM IST</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
