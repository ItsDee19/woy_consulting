import "server-only";
import { cache } from "react";
import { orderBriefs, toEngagement } from "./map-case-studies";
import { toListing, toPractitioner, toProfile } from "./map-people";
import { toResource } from "./map-resources";
import { loadQuery } from "./source";
import type { RawCaseStudy, RawPerson, RawResource } from "./raw";
import type { Resource } from "./types";

const rawCaseStudies = cache(() => loadQuery<RawCaseStudy[]>("caseStudies"));
const rawPeople = cache(() => loadQuery<RawPerson[]>("people"));

export const getEngagements = cache(async () => (await rawCaseStudies()).map(toEngagement));
export async function getEngagement(slug: string) { return (await getEngagements()).find((item) => item.slug === slug); }

export const getCaseStudyBriefs = cache(async () => orderBriefs(await rawCaseStudies()));
export async function getCaseStudyBrief(slug: string) { return (await getCaseStudyBriefs()).find((item) => item.slug === slug); }

export const getProfiles = cache(async () => (await rawPeople()).map(toProfile));
export async function getProfile(slug: string) { return (await getProfiles()).find((item) => item.slug === slug); }
export const getPeopleListings = cache(async () => (await rawPeople()).map(toListing));
export const getPractitioners = cache(async () => (await rawPeople()).map(toPractitioner));

export const getResources = cache(async () =>
  (await loadQuery<RawResource[]>("resources")).map(toResource).filter((item): item is Resource => item !== null));
