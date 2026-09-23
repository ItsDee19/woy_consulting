import styles from "./Stats.module.css";

const STATS = [
  { value: "Since 2015", label: "Grounded in business reality" },
  { value: "10+", label: "Consultants" },
  { value: "25+", label: "Coaches" },
  { value: "Partner-led", label: "From first conversation to delivery" },
];

export function Stats() {
  return (
    <section className={styles.section} aria-label="WOY at a glance" data-home-stats>
      <div className="shell">
        <dl className={styles.grid}>
          {STATS.map(({ value, label }) => (
            <div key={value} className={styles.item}>
              <dt className={styles.value}>{value}</dt>
              <dd className={styles.label}>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
