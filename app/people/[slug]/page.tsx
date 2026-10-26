import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/people/ProfilePage";
import { pageMetadata } from "@/lib/metadata";
import { getProfiles } from "@/lib/cms/content";

type ProfileRouteProps = { params: Promise<{ slug: string }> };

async function findProfile(slug: string) {
  const profile = (await getProfiles()).find(person => person.slug === slug);
  if (!profile) notFound();
  return profile;
}

export async function generateStaticParams() {
  return (await getProfiles()).map(profile => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: ProfileRouteProps): Promise<Metadata> {
  const profile = await findProfile((await params).slug);
  return pageMetadata(profile.name, profile.introduction, `/people/${profile.slug}`);
}

export default async function PersonProfilePage({ params }: ProfileRouteProps) {
  const profile = await findProfile((await params).slug);
  return <ProfilePage profile={profile} />;
}
