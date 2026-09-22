"use client";

import { useEffect } from "react";

/** Keep current expertise links and saved capability links working together. */
export function ExpertiseAnchors() {
  useEffect(() => {
    let frame = 0;
    function openLinkedCapability() {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      if (!id) return;
      const target = document.getElementById(id);
      const disclosure = target?.closest("details");
      if (!(disclosure instanceof HTMLDetailsElement) || !disclosure.closest("#expertise")) return;
      disclosure.open = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => disclosure.scrollIntoView({ block: "start", behavior: "instant" }));
    }
    openLinkedCapability();
    window.addEventListener("hashchange", openLinkedCapability);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openLinkedCapability);
    };
  }, []);
  return null;
}
