import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { practitioners } from "@/lib/content";
import styles from "./LeadershipSection.module.css";

const founder = practitioners.find((person) => person.slug === "vipin-tuteja")!;

export function LeadershipSection() {
  return (
    <section className={styles.section} aria-labelledby="leadership-title" data-home-leadership>
      <div className={styles.layout}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Experience in the room</p>
          <h2 id="leadership-title">
            We’ve led businesses.
            <em>We understand what it takes.</em>
          </h2>
        </header>

        <figure className={styles.profile}>
          <div className={styles.portraitFrame}>
            <Image
              src="/practitioners/vipin-tuteja-homepage.webp"
              alt={`${founder.name}, founder and managing director of WOY Consulting`}
              width={575}
              height={710}
              sizes="(min-width: 1900px) 575px, (min-width: 901px) 31vw, (min-width: 650px) 575px, 91vw"
              className={styles.portrait}
              loading="lazy"
            />
          </div>
          <figcaption className={styles.identity}>
            <span className={styles.name}>{founder.name}</span>
            <span className={styles.role}>Founder &amp; Managing Director</span>
          </figcaption>
        </figure>

        <div className={styles.copy}>
          <p>
            We have run P&amp;Ls, built teams and led organisations through change.
            That experience shapes the questions we ask and the solutions we build with you.
          </p>
          <p>
            The partners you meet stay involved through delivery, bringing senior judgement,
            continuity and a practical commitment to adoption.
          </p>
          <Link href="/practitioners" className={styles.link}>
            <span>Meet our Leadership &amp; Partners</span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.experience} aria-label="Vipin Tuteja’s leadership experience">
          <p className={styles.credential}><strong>35+ years of leadership</strong></p>
          <ul className={styles.career} aria-label="Organisations where Vipin has held leadership roles">
            <li>Xerox</li><li>American Express</li><li>Ricoh</li><li>Samsung</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
