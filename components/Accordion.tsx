"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { approach } from "@/lib/content";

/** The 4D approach as drop-downs. One open at a time, first open by default. */
export function ApproachAccordion({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [open, setOpen] = useState<string | null>(approach[0].key);

  const line = tone === "dark" ? "border-blockline" : "border-line";
  const head = tone === "dark" ? "text-onblock" : "text-ink";
  const body = tone === "dark" ? "text-onblock2" : "text-ink2";

  return (
    <div className={`border-t ${line}`}>
      {approach.map((step) => {
        const isOpen = open === step.key;
        return (
          <div key={step.key} className={`border-b ${line}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`panel-${step.key}`}
                id={`btn-${step.key}`}
                onClick={() => setOpen(isOpen ? null : step.key)}
                className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-6 text-left transition-colors md:grid-cols-[16rem_1fr_auto] md:py-8 ${head} hover:text-redb`}
              >
                <span
                  className={`t-h3 transition-colors ${isOpen ? "text-redb" : ""}`}
                >
                  {step.title}
                </span>
                <span className={`col-start-1 text-sm font-light md:col-start-2 ${body}`}>
                  {step.tag}
                </span>
                <Plus
                  size={22}
                  aria-hidden
                  className={`col-start-2 row-start-1 transition-transform duration-500 md:col-start-3 ${
                    isOpen ? "rotate-45 text-redb" : body
                  }`}
                />
              </button>
            </h3>

            <div
              className="acc-panel"
              data-open={isOpen}
              id={`panel-${step.key}`}
              role="region"
              aria-labelledby={`btn-${step.key}`}
            >
              <div>
                <div className="pb-8 md:pl-[16rem]">
                  <p className={`max-w-[62ch] font-light leading-relaxed ${body}`}>
                    {step.body}
                  </p>
                  <ul role="list" className="mt-6 flex flex-wrap gap-2">
                    {step.outputs.map((o) => (
                      <li
                        key={o}
                        className={`rounded-[2px] border px-3 py-1.5 text-xs ${line} ${body}`}
                      >
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
