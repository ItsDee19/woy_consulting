import { PageIntro } from "@/components/recreation/Site";
import { StructuredData } from "@/components/StructuredData";
import { getResources } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/metadata";
import { contentPageGraph } from "@/lib/structured-data";
import { ResourceList } from "./ResourceList";
import styles from "./resources.module.css";

const description = "Brochures, reports and other documents from WOY Consulting, ready to download.";
export const metadata = pageMetadata("Resources", description, "/resources");

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <div className="recreation">
      <StructuredData id="resources-structured-data" nodes={contentPageGraph({ path: "/resources", name: "Resources", description, type: "CollectionPage" })} />
      <PageIntro label="Resources" title={<>Perspectives and materials.<br /><em>Ready to share.</em></>}>
        <p>Brochures, reports and other documents from WOY Consulting.</p>
      </PageIntro>
      <section className={`wrap ${styles.library}`} aria-label="Documents">
        <ResourceList resources={resources} />
      </section>
    </div>
  );
}
