"use client";

import { useEffect } from "react";

/** Preserve current and saved capability links when the accordion layout changes. */
export function ExpertiseAnchors({ onOpen }: { onOpen: (slug: string) => void }) {
  useEffect(() => {
    let frame = 0;
    function openLinkedCapability() {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      if (!id) return;
      const target = document.getElementById(id);
      const area = target?.closest<HTMLElement>("[data-expertise-area]");
      if (!area || !area.closest("#expertise")) return;
      onOpen(area.id);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => area.scrollIntoView({ block: "start", behavior: "instant" }));
    }
    openLinkedCapability();
    window.addEventListener("hashchange", openLinkedCapability);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openLinkedCapability);
    };
  }, [onOpen]);
  return null;
}
