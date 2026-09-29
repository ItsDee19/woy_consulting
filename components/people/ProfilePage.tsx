import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PersonProfile } from "@/lib/people-profiles";
import styles from "./ProfilePage.module.css";

export function ProfilePage({ profile }: { profile: PersonProfile }) {
  return (
    <div className={`recreation ${styles.page}`}>
      <div className={styles.container}>
        <Link href="/people" className={styles.returnLink}>
          Leadership &amp; Partners <ArrowUpRight size={17} aria-hidden="true" />
        </Link>

        <div className={styles.layout}>
          <figure className={styles.portrait}>
            <Image
              src={profile.portrait}
              alt={profile.name}
              fill
              sizes="(max-width: 700px) 88vw, (max-width: 1439px) 34vw, 473px"
              className={styles.image}
              style={{ objectPosition: profile.imagePosition }}
              priority
            />
          </figure>

          <article className={styles.biography} aria-labelledby="profile-name">
            <p className={styles.eyebrow}>{profile.role}</p>
            <h1 id="profile-name" className={styles.name}>{profile.name}</h1>
            <p className={styles.introduction}>{profile.introduction}</p>
            <div className={styles.paragraphs}>
              {profile.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <section className={styles.experience} aria-labelledby="profile-experience-title">
              <h2 id="profile-experience-title" className={styles.eyebrow}>Previous corporate experience</h2>
              <ul className={styles.organisations}>
                {profile.experience.map((organisation) => <li key={organisation}>{organisation}</li>)}
              </ul>
            </section>

            <Link href="/contact" className={styles.contact}>
              Start a conversation <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
