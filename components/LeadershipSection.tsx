import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { practitioners } from "@/lib/content";
import styles from "./LeadershipSection.module.css";

const founder = practitioners.find((person) => person.slug === "vipin-tuteja")!;

export function LeadershipSection() {
  return (
    <section className={styles.section} aria-labelledby="leadership-title" data-home-leadership>
      <div className={`shell ${styles.layout}`}>
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
              sizes="(max-width: 700px) min(360px, calc(100vw - 40px)), (max-width: 1023px) 40vw, 430px"
              className={styles.portrait}
              loading="lazy"
            />
          </div>
          <figcaption className={styles.identity}>
            <span className={styles.name}>{founder.name}</span>
            <span className={styles.role}>{founder.role}</span>
          </figcaption>
        </figure>

        <div className={styles.copy}>
          <p>
            Our people have run P&amp;Ls, built teams and led organisations through change.
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
          <p className={styles.credential}><strong>Business leadership</strong><span>Strategy, execution and P&amp;L ownership</span></p>
          <div className={styles.career}>
            <p>Experience across</p>
            <ul aria-label="Organisations where Vipin has held leadership roles">
              <li>Xerox</li><li>American Express</li><li>Ricoh</li><li>Samsung</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
