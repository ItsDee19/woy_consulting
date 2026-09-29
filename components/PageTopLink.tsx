"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type PageTopLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
};

/** Keep normal route/anchor navigation, and re-scroll an already active top link. */
export function PageTopLink({ href, ...props }: PageTopLinkProps) {
  return (
    <Link {...props} href={href} onNavigate={(event) => {
      if (new URL(href, window.location.href).href !== window.location.href) return;
      // Next does not create a fresh scroll target for an unchanged URL.
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }} />
  );
}
