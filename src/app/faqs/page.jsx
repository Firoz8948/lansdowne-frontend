'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './faqs.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import PageHeroBanner from '@/components/PageHeroBanner/PageHeroBanner';

const faqGroups = [
  {
    group: 'Orders & Shipping',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our collections, add items to your cart, and proceed to checkout. You can pay via UPI, credit/debit card, net banking, or Cash on Delivery. Once your order is confirmed, you will receive an email and SMS confirmation with your order details.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is dispatched, you will receive an SMS and email notification with a tracking link. You can click the link to view real-time shipment status from our courier partner.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders are dispatched within 24–48 business hours of confirmation (Monday to Saturday). After dispatch, delivery takes 3–5 business days to metro cities, 4–6 business days to tier-2 cities, 5–8 business days to tier-3 cities and rural areas, and 7–10 business days to North-East India and remote locations.',
      },
      {
        q: 'Do you deliver across India?',
        a: 'Yes, we deliver to all serviceable pin codes across India. If a pin code is not serviceable by our courier partner, we will contact you before dispatch.',
      },
      {
        q: 'Is there a shipping charge?',
        a: 'Shipping is free on all prepaid orders, with no minimum order value. Cash on Delivery orders carry a ₹99 COD charge, shown at checkout.',
      },
    ],
  },
  {
    group: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, Rupay), UPI (Google Pay, PhonePe, Paytm), net banking, and Cash on Delivery (COD). All online payments are processed through a secure, PCI-DSS compliant payment gateway.',
      },
      {
        q: 'Is Cash on Delivery (COD) available?',
        a: 'Yes, COD is available on eligible orders across most pin codes in India. A ₹99 COD charge applies to Cash on Delivery orders. COD availability is displayed at checkout.',
      },
      {
        q: 'Are my payment details secure?',
        a: 'Absolutely. We use 256-bit SSL encryption and partner with RBI-compliant payment gateways to ensure your financial information is fully protected. We never store your card details on our servers.',
      },
    ],
  },
  {
    group: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'You can request a return within 7 days of delivery. The wallet, bag or belt must be unused, free of marks, scratches or stains, and returned in its original packaging with all tags intact. Personalised items and products bought in a clearance or final sale cannot be returned. Received a damaged or wrong item? Contact us within 48 hours of delivery for a free replacement or full refund.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Contact our support team at lansdowneleather1@gmail.com or call +91 89795 43500 with your order number. Once approved, our courier partner will schedule a pickup from your delivery address within 2–3 business days.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are initiated within 48 hours of receiving and inspecting the returned item. The amount is credited to your original payment method within 5–7 business days. For COD orders, refunds are processed to your bank account.',
      },
      {
        q: 'Can I exchange a product instead of returning it?',
        a: 'Yes. Within the 7-day return window you can exchange for a different colour of the same product, or a different size for belts, subject to stock availability. Contact our support team to start an exchange. If the variant you want is unavailable, we will refund you instead.',
      },
    ],
  },
  {
    group: 'Products & Care',
    items: [
      {
        q: 'Are your products genuine and original?',
        a: 'Yes. Our wallets, bags and belts are made of genuine leather, and every piece is checked by us in Lansdowne before it is dispatched.',
      },
      {
        q: 'How should I care for my leather products?',
        a: 'Wipe with a soft, dry cloth to remove dust. Keep the product away from water, direct sunlight and heat. If it gets wet, let it air-dry naturally. Do not use a hair dryer. Store it in a cool, dry place when not in use, and apply a leather conditioner every few months to keep it supple.',
      },
      {
        q: 'A product I want is out of stock. Will it be restocked?',
        a: 'Popular items are restocked regularly. Message us on WhatsApp at +91 89795 43500 and we will let you know as soon as it is back in stock.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button
        type="button"
        className={styles.faqQuestion}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          size={18}
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
        />
      </button>
      <div className={`${styles.faqAnswer} ${open ? styles.faqAnswerOpen : ''}`}>
        <p className={styles.faqAnswerText}>{a}</p>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  return (
    <div className={styles.container}>
      <Header />
      <PageHeroBanner
        title="Frequently Asked Questions"
        subtitle="Have questions? Here are quick answers to the most common inquiries about orders, payments, and more."
      />

      <main className={styles.main}>
        {faqGroups.map((group, gi) => (
          <section key={gi} className={styles.faqGroup}>
            <h2 className={styles.groupTitle}>{group.group}</h2>
            <div className={styles.faqList}>
              {group.items.map((faq, fi) => (
                <FAQItem key={fi} q={faq.q} a={faq.a} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
