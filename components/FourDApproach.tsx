import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { steps } from "@/lib/recreation-content";
import styles from "./FourDApproach.module.css";

export default function FourDApproach() {
  return (
    <section id="our-4d-approach" className={styles.section} aria-labelledby="four-d-heading">
      <div className={styles.container}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>Our 4D approach</p>
            <h2 id="four-d-heading" className={styles.heading}>From understanding<br />to forward movement.</h2>
          </div>
          <Link href="/approach" className={styles.link}>
            How we work <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <ol className={styles.steps} role="list">
          {steps.map((step, index) => (
            <li key={step.name} className={styles.step}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <h3 className={styles.title}>{step.name}</h3>
              <p className={styles.description}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
