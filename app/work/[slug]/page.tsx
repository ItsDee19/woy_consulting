import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngagementPage } from "@/components/work/EngagementPage";
import { getEngagements } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/metadata";

type EngagementRouteProps = { params: Promise<{ slug: string }> };

async function findEngagement(slug: string) {
  const engagements = await getEngagements();
  const engagement = engagements.find(item => item.slug === slug);
  if (!engagement) notFound();
  return { engagement, related: engagements.filter(item => item.slug !== slug).slice(0, 2) };
}

export async function generateStaticParams() {
  return (await getEngagements()).map(item => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: EngagementRouteProps): Promise<Metadata> {
  const { engagement } = await findEngagement((await params).slug);
  return pageMetadata(engagement.title, engagement.summary, `/work/${engagement.slug}`);
}

export default async function EngagementDetailPage({ params }: EngagementRouteProps) {
  const { engagement, related } = await findEngagement((await params).slug);
  return <EngagementPage engagement={engagement} related={related} />;
}
