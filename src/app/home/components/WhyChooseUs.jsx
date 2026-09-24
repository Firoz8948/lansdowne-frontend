import styles from '../home.module.css';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Craft',
    desc: 'Precision-finished by hand. Every stitch considered.',
  },
  {
    num: '02',
    title: 'Material',
    desc: 'Chosen for longevity, natural beauty, and feel.',
  },
  {
    num: '03',
    title: 'Form',
    desc: 'Refined design that settles quietly into any space.',
  },
  {
    num: '04',
    title: 'Assurance',
    desc: 'Direct manufacturer warranty. Clear returns.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className={`${styles.section} ${styles.featuresSection}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>THE LANSDOWNE DIFFERENCE</h2>
        <p className={styles.sectionSubtitle}>What we stand by</p>
      </div>

      <ul className={styles.principlesList}>
        {PRINCIPLES.map((item) => (
          <li key={item.num} className={styles.principleItem}>
            <span className={styles.principleNum} aria-hidden="true">
              {item.num}
            </span>
            <h3 className={styles.principleTitle}>{item.title}</h3>
            <p className={styles.principleDesc}>{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
