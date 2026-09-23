"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CaretDown, ArrowUpRight } from "@phosphor-icons/react";
import type { ExpertiseArea } from "@/lib/content";
import { ExpertiseAnchors } from "./ExpertiseAnchors";
import styles from "./ExpertiseSection.module.css";

function ExpertiseDetail({ area }: { area: ExpertiseArea }) {
  return (
    <div className={styles.detail}>
      <p className={styles.description}>{area.summary}</p>
      <Link href={area.href} className={styles.link}>
        Explore this expertise <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function ExpertiseAccordion({ areas }: { areas: ExpertiseArea[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(areas[0]?.slug ?? null);
  const [anchorNavigation, setAnchorNavigation] = useState(false);
  const openLinkedArea = useCallback((slug: string) => {
    setAnchorNavigation(true);
    setOpenSlug(slug);
  }, []);

  return (
    <>
      <ExpertiseAnchors onOpen={openLinkedArea} />
      <div className={styles.areas} data-expertise-accordion data-anchor-navigation={anchorNavigation}>
        {areas.map((area, index) => {
          const open = openSlug === area.slug;
          const triggerId = `expertise-${area.slug}-trigger`;
          const panelId = `expertise-${area.slug}-panel`;
          return (
            <article key={area.slug} id={area.slug} className={styles.area} data-expertise-area>
              {area.legacySlugs.map(slug => <span key={slug} id={slug} className={styles.legacyAnchor} aria-hidden="true" />)}
              <h3>
                <button id={triggerId} type="button" className={styles.trigger}
                  aria-expanded={open} aria-controls={panelId}
                  onClick={() => {
                    setAnchorNavigation(false);
                    setOpenSlug(current => current === area.slug ? null : area.slug);
                  }}>
                  <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.title}>{area.title}</span>
                  <CaretDown className={styles.indicator} size={18} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={triggerId}
                className={styles.panel} data-open={open} aria-hidden={!open} inert={!open}>
                <div className={styles.panelInner}><ExpertiseDetail area={area} /></div>
              </div>
            </article>
          );
        })}
      </div>
      <noscript>
        <div className={styles.fallback}>
          {areas.map((area, index) => (
            <details key={area.slug} className={styles.area} name="woy-expertise-fallback" open={index === 0}>
              <summary className={styles.trigger}>
                <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.title}>{area.title}</span>
                <CaretDown className={styles.indicator} size={18} aria-hidden="true" />
              </summary>
              <ExpertiseDetail area={area} />
            </details>
          ))}
        </div>
      </noscript>
    </>
  );
}
