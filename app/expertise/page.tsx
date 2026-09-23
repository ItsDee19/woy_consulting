import { StructuredData } from "@/components/StructuredData";
import { PageIntro, TextLink } from "@/components/recreation/Site";
import { expertise, cases } from "@/lib/recreation-content";
import { pageMetadata } from "@/lib/metadata";
import { contentPageGraph } from "@/lib/structured-data";

export const metadata = pageMetadata(
  "Our expertise",
  "Business consulting across strategy, growth, leadership, organisation, culture, HR and performance systems.",
  "/expertise",
);

export default function ExpertisePage() {
  return (
    <div className="recreation">
      <StructuredData id="expertise-structured-data" nodes={contentPageGraph({
        path: "/expertise", name: "Our expertise", description: metadata.description ?? "",
      })} />
      <PageIntro label="Our expertise" title={<>The ambition is yours.<br /><em>The work is shared.</em></>}>
        <p>Four connected areas of advisory. Each shaped around your business reality, with our partners involved from diagnosis to delivery.</p>
      </PageIntro>
      <div className="wrap expertise-details">
        {expertise.map((item) => (
          <section id={item.id} className="expertise-detail" key={item.id}>
            <div className="expertise-detail-title">
              <span className="eyebrow red">{item.number} /</span>
              <h2>{item.title}</h2>
            </div>
            <div>
              <h3>{item.question}</h3>
              <p className="muted expertise-description">{item.description}</p>
              <ul className="service-list">
                {item.services.map((service) => <li key={service}>{service}</li>)}
              </ul>
              <div className="expertise-case">
                <span className="eyebrow muted">In practice</span>
                <TextLink href={`/work/${item.caseSlug}`}>
                  {cases.find((study) => study.slug === item.caseSlug)?.title}
                </TextLink>
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="wrap section expertise-note">
        <p className="eyebrow red">Designed around your context</p>
        <h2>Start with the challenge.<br />Build the right response.</h2>
        <p className="muted">Your priorities may cross several of these areas. We bring the relevant experience together to design a coherent engagement, with clear outcomes and practical ownership.</p>
        <TextLink href="/contact">Discuss your priorities</TextLink>
      </section>
    </div>
  );
}
