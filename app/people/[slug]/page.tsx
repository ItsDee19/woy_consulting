import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/people/ProfilePage";
import { pageMetadata } from "@/lib/metadata";
import { peopleProfiles } from "@/lib/people-profiles";

type ProfileRouteProps = { params: Promise<{ slug: string }> };

function findProfile(slug: string) {
  const profile = peopleProfiles.find(person => person.slug === slug);
  if (!profile) notFound();
  return profile;
}

export function generateStaticParams() {
  return peopleProfiles.map(profile => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: ProfileRouteProps): Promise<Metadata> {
  const profile = findProfile((await params).slug);
  return pageMetadata(profile.name, profile.introduction, `/people/${profile.slug}`);
}

export default async function PersonProfilePage({ params }: ProfileRouteProps) {
  const profile = findProfile((await params).slug);
  return <ProfilePage profile={profile} />;
}
