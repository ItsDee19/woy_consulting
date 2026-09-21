"use client";

import { useEffect } from "react";

/** Open the requested native disclosure when a saved service link is followed. */
export function ExpertiseAnchors() {
  useEffect(() => {
    let frame = 0;
    function openLinkedCapability() {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      if (!id) return;
      const target = document.getElementById(id);
      if (!(target instanceof HTMLDetailsElement) || !target.closest("#expertise")) return;
      target.open = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "instant" }));
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
