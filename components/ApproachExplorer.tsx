"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { approach } from "@/lib/content";
import styles from "./ApproachExplorer.module.css";

const outcomes = ["Insight", "Alignment", "Capability", "Sustained execution"];
const coordinates = [
  { x: 174, y: 354 },
  { x: 249, y: 279 },
  { x: 324, y: 204 },
  { x: 399, y: 129 },
];

function Arrow({ backwards = false }: { backwards?: boolean }) {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" style={backwards ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ApproachExplorer() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const previous = (active + approach.length - 1) % approach.length;
  const next = (active + 1) % approach.length;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let destination: number;
    switch (event.key) {
      case "ArrowRight": destination = (index + 1) % approach.length; break;
      case "ArrowLeft": destination = (index + approach.length - 1) % approach.length; break;
      case "Home": destination = 0; break;
      case "End": destination = approach.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(destination);
    tabs.current[destination]?.focus();
  }

  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`} data-approach-explorer>
      <div className="shell">
        <div className={styles.sectionHeader}>
          <h2 id={`${id}-heading`}>Explore the four stages</h2>
          <p>Partner-led. Connected throughout.</p>
        </div>

        <noscript>
          <style>{`.${styles.tabs}, .${styles.workspace} { display: none; }`}</style>
          <div className={styles.fallback}>
            {approach.map((step, index) => (
              <section key={step.key} className={styles.fallbackStage}>
                <p className={styles.stageLabel}>0{index + 1} / {step.title}</p>
                <h3 className={styles.stageHeading}>{step.tag}.</h3>
                <p className={styles.body}>{step.body}</p>
                <p className={styles.outputsLabel}>What takes shape</p>
                <ul className={styles.outputs}>{step.outputs.map((output) => <li key={output}>{output}</li>)}</ul>
                <div className={styles.outcome}><span>The result</span><strong>{outcomes[index]}</strong></div>
              </section>
            ))}
          </div>
        </noscript>

        <div className={styles.tabs} role="tablist" aria-label="The four stages of the WOY approach">
          {approach.map((step, index) => (
            <button
              key={step.key}
              type="button"
              role="tab"
              id={`${id}-tab-${step.key}`}
              aria-controls={`${id}-panel-${step.key}`}
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              ref={(element) => { tabs.current[index] = element; }}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className={styles.tabNumber} aria-hidden="true">0{index + 1}</span>
              <span className={styles.tabCopy}>
                <span className={styles.tabTitle}>{step.title}</span>
                <span className={styles.tabOutcome}>{outcomes[index]}</span>
              </span>
              <svg className={styles.tabArrow} aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13 13 3M4 3h9v9" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          ))}
        </div>

        <div className={styles.workspace}>
          <div className={styles.visual} aria-hidden="true">
            <svg className={styles.trajectory} viewBox="0 0 590 500" fill="none">
              <defs>
                <linearGradient id={`${id}-plane`} x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="var(--c-on-navy)" stopOpacity=".065" />
                  <stop offset="1" stopColor="var(--c-on-navy)" stopOpacity=".01" />
                </linearGradient>
                <radialGradient id={`${id}-focus`}>
                  <stop stopColor="var(--c-logo-accent)" stopOpacity=".13" />
                  <stop offset="1" stopColor="var(--c-logo-accent)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path d="M35 388 300 235 567 388 301 541Z M-72 326 300 111 674 327 M-72 203 300-12 674 204" className={styles.ground} />
              <path d="M35 388 35 270M567 388V270M301 466v-72M73 426l-18-10M547 426l18-10" className={styles.ground} />
              <path d="M61 468h70M61 468v-34" className={styles.axis} />
              <text x="61" y="491" className={styles.axisLabel}>YOUR OPERATING REALITY</text>
              <path d="M466 45h56v56M496 70l26-25" className={styles.direction} />
              <text x="351" y="27" className={styles.axisLabel}>LASTING CHANGE</text>

              {approach.map((step, index) => {
                const { x, y } = coordinates[index];
                return (
                  <g key={step.key} className={styles.planeGroup} data-active={index === active}>
                    <ellipse cx={x} cy={y} rx="150" ry="96" fill={`url(#${id}-focus)`} className={styles.focus} />
                    <path d={`M${x - 131} ${y} ${x} ${y - 75} ${x + 131} ${y} ${x} ${y + 75}Z`} fill="var(--c-navy)" />
                    <path d={`M${x - 131} ${y} ${x} ${y - 75} ${x + 131} ${y} ${x} ${y + 75}Z`} fill={`url(#${id}-plane)`} className={styles.plane} />
                    <path d={`M${x - 131} ${y}v12l131 75 131-75v-12M${x} ${y + 75}v12`} className={styles.planeEdge} />
                    <path d={`M${x - 85} ${y + 26} ${x - 42} ${y + 1}M${x + 42} ${y + 1}l43 25`} className={styles.planeDetail} />
                    <text x={x + 23} y={y + 72} transform={`rotate(-30 ${x + 23} ${y + 72})`} className={styles.planeLabel}>0{index + 1} / {step.title.toUpperCase()}</text>
                  </g>
                );
              })}

              <path d="M174 354 249 279 324 204 399 129" className={styles.rail} />
              {coordinates.map(({ x, y }, index) => (
                <g key={index} className={styles.waypoint} data-active={index === active}>
                  <circle cx={x} cy={y} r="15" className={styles.nodeHalo} />
                  <circle cx={x} cy={y} r="5" className={styles.node} />
                </g>
              ))}
            </svg>
            <div className={styles.visualCaption}>
              <span className={styles.captionMark} />
              <p>Each stage builds on the last.<br /><strong>Your people carry the change forward.</strong></p>
            </div>
          </div>

          <div className={styles.detailColumn}>
            <div className={styles.panels}>
              {approach.map((step, index) => (
                <div
                  key={step.key}
                  role="tabpanel"
                  id={`${id}-panel-${step.key}`}
                  aria-labelledby={`${id}-tab-${step.key}`}
                  aria-hidden={index !== active}
                  inert={index !== active}
                  tabIndex={index === active ? 0 : -1}
                  className={`${styles.panel} ${index === active ? styles.activePanel : styles.inactivePanel}`}
                >
                  <p className={styles.stageLabel}><span>0{index + 1}</span> / {step.title}</p>
                  <h3 className={styles.stageHeading}>{step.tag}.</h3>
                  <p className={styles.body}>{step.body}</p>
                  <p className={styles.outputsLabel}>What takes shape</p>
                  <ul className={styles.outputs}>
                    {step.outputs.map((output) => (
                      <li key={output}><span aria-hidden="true">↗</span>{output}</li>
                    ))}
                  </ul>
                  <div className={styles.outcome}><span>The result</span><strong>{outcomes[index]}</strong></div>
                </div>
              ))}
            </div>

            <div className={styles.navigation}>
              <button type="button" onClick={() => setActive(previous)} aria-label={`Previous stage: ${approach[previous].title}`} className={styles.previous}>
                <Arrow backwards /><span>Previous</span>
              </button>
              <span className={styles.progress} aria-hidden="true">0{active + 1} <span>/</span> 04</span>
              <button type="button" onClick={() => setActive(next)} aria-label={`Next stage: ${approach[next].title}`} className={styles.next}>
                <span>{active === approach.length - 1 ? "Back to Discover" : "Next stage"}</span><Arrow />
              </button>
            </div>
            <p className="sr-only" role="status">Stage {active + 1} of {approach.length}: {approach[active].title}.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
