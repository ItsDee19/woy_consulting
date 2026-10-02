import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngagementPage } from "@/components/work/EngagementPage";
import { pageMetadata } from "@/lib/metadata";
import { cases } from "@/lib/recreation-content";

type EngagementRouteProps = { params: Promise<{ slug: string }> };

function findEngagement(slug: string) {
  const engagement = cases.find(item => item.slug === slug);
  if (!engagement) notFound();
  return engagement;
}

export function generateStaticParams() {
  return cases.map(item => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: EngagementRouteProps): Promise<Metadata> {
  const engagement = findEngagement((await params).slug);
  return pageMetadata(engagement.title, engagement.summary, `/work/${engagement.slug}`);
}

export default async function EngagementDetailPage({ params }: EngagementRouteProps) {
  return <EngagementPage engagement={findEngagement((await params).slug)} />;
}
