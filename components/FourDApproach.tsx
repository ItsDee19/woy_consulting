"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { approach } from "@/lib/content";
import styles from "./FourDApproach.module.css";

const outcomes = ["Insight", "Alignment", "Capability", "Sustained execution"];
const compassLabels = [
  { x: 210, y: 26 },
  { x: 394, y: 216 },
  { x: 210, y: 408 },
  { x: 26, y: 216 },
];

export default function FourDApproach() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % approach.length; break;
      case "ArrowLeft": next = (index - 1 + approach.length) % approach.length; break;
      case "Home": next = 0; break;
      case "End": next = approach.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <div className="shell">
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>The WOY 4D approach</p>
            <h2 id={`${id}-heading`} className={styles.heading}>From insight to<br />lasting change.</h2>
          </div>
          <p className={styles.intro}>
            A clear path from understanding your reality to building change your people can sustain.
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Explore the four stages of our approach">
          {approach.map((step, index) => (
            <button
              type="button"
              role="tab"
              key={step.key}
              id={`${id}-tab-${step.key}`}
              aria-controls={`${id}-panel-${step.key}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              ref={(element) => { tabs.current[index] = element; }}
              className={styles.tab}
              onClick={() => setActive(index)}
              onKeyDown={(event) => moveFocus(event, index)}
            >
              <span className={styles.tabNumber} aria-hidden="true">0{index + 1}</span>
              <span className={styles.tabName}>{step.title}</span>
              <span className={styles.tabOutcome}>{outcomes[index]}</span>
            </button>
          ))}
        </div>

        <div className={styles.stage}>
          <div className={styles.diagram} aria-hidden="true">
            <svg viewBox="0 0 420 420" fill="none" className={styles.compass}>
              <circle cx="210" cy="210" r="164" className={styles.guide} />
              <circle cx="210" cy="210" r="115" className={styles.innerGuide} />
              <path d="M210 38V87M210 333V382M38 210H87M333 210H382" className={styles.axes} />
              {approach.map((step, index) => (
                <g key={step.key} data-active={active === index} className={styles.quadrant}>
                  <circle
                    cx="210" cy="210" r="144" pathLength="100"
                    strokeDasharray="22 78"
                    transform={`rotate(${-129.6 + index * 90} 210 210)`}
                    className={styles.arc}
                  />
                  <text x={compassLabels[index].x} y={compassLabels[index].y} textAnchor="middle" className={styles.compassNumber}>
                    0{index + 1}
                  </text>
                </g>
              ))}
              <g className={styles.pointer} style={{ transform: `rotate(${active * 90}deg)` }}>
                <path d="M210 76L217 94H203L210 76Z" fill="currentColor" />
              </g>
              <text x="210" y="234" textAnchor="middle" className={styles.fourD}>4D</text>
              <text x="210" y="264" textAnchor="middle" className={styles.compassCaption}>THE WOY METHOD</text>
            </svg>
            <p className={styles.diagramCaption}>Purposeful at every stage.<br /><strong>Partner-led throughout.</strong></p>
          </div>

          <div className={styles.details}>
            <div className={styles.panels}>
              {approach.map((step, index) => (
                <div
                  key={step.key}
                  role="tabpanel"
                  id={`${id}-panel-${step.key}`}
                  aria-labelledby={`${id}-tab-${step.key}`}
                  aria-hidden={active !== index}
                  tabIndex={active === index ? 0 : -1}
                  className={`${styles.panel} ${active === index ? styles.activePanel : styles.inactivePanel}`}
                >
                  <p className={styles.stageLabel}>0{index + 1} <span>/</span> {step.title}</p>
                  <h3 className={styles.stageHeading}>{step.tag}.</h3>
                  <p className={styles.body}>{step.body}</p>
                  <p className={styles.outputsLabel}>What takes shape</p>
                  <ul className={styles.outputs}>
                    {step.outputs.map((output) => (
                      <li key={output}><span aria-hidden="true">↗</span>{output}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link href="/approach" className={styles.link}>
              Explore our approach
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
