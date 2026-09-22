import { Award, Feather, Sparkles, HeartHandshake } from 'lucide-react';
import styles from '../home.module.css';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Award size={24} />,
      title: 'Master Craftsmanship',
      desc: 'Each creation is precision-finished with superior attention to detail.',
    },
    {
      icon: <Feather size={24} />,
      title: 'Premium Materials',
      desc: 'Selected for longevity, natural beauty, and unmatched durability.',
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Timeless Aesthetics',
      desc: 'Modern refined design that effortlessly complements any setting.',
    },
    {
      icon: <HeartHandshake size={24} />,
      title: 'Customer First',
      desc: 'Direct manufacturer warranty and transparent return support.',
    },
  ];

  return (
    <section className={`${styles.section} ${styles.featuresSection}`} style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-xl)' }}>
      <div className={styles.sectionHeader} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h2 className={styles.sectionTitle}>THE LANSDOWNE DIFFERENCE</h2>
        <p className={styles.sectionSubtitle}>Why Choose Lansdowne</p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feat, idx) => (
          <div key={idx} className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>{feat.icon}</div>
            <h3 className={styles.featureTitle}>{feat.title}</h3>
            <p className={styles.featureDesc}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
