/* eslint-disable @next/next/no-img-element -- Preserve the supplied recreation asset and its original rendering. */
import { StructuredData } from "@/components/StructuredData";
import { PageIntro, FourSteps, TextLink } from "@/components/recreation/Site";
import { brandPhilosophy, philosophyDetailIntroduction } from "@/lib/recreation-philosophy";
import { pageMetadata } from "@/lib/metadata";
import { contentPageGraph } from "@/lib/structured-data";

export const metadata = pageMetadata(
  "Our approach",
  "Discover, Define, Design, Deliver. A structured path from understanding to sustained adoption, grounded in the Win Over Yourself philosophy.",
  "/approach",
);

export default function ApproachPage() {
  return (
    <div className="recreation">
      <StructuredData id="approach-structured-data" nodes={contentPageGraph({
        path: "/approach", name: "Our approach", description: metadata.description ?? "",
      })} />
      <PageIntro label="Our approach" title={<>Clarity in the thinking.<br /><em>Discipline in the doing.</em></>}>
        <p>Since 2015, WOY has helped leaders connect ambition with the practical work of change. Every engagement is tailored. Every engagement is partner-led.</p>
      </PageIntro>
      <section className="approach-band">
        <div className="wrap section">
          <div className="section-head">
            <div>
              <p className="eyebrow red">Discover · Define · Design · Deliver</p>
              <h2>A structured path.<br />A tailored response.</h2>
            </div>
            <p>Our 4D approach brings rigour to diagnosis and flexibility to delivery, with adoption considered from the start.</p>
          </div>
          <FourSteps />
        </div>
      </section>
      <section className="wrap section approach-principles">
        <div>
          <p className="eyebrow red">How it feels to work with us</p>
          <h2>Close to your business.<br />Accountable for the work.</h2>
        </div>
        <div className="principles-list">
          <div>
            <span>01</span>
            <h3>Business leadership perspective</h3>
            <p>Advice shaped by experience of targets, talent, trade-offs and execution in real operating environments.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Bespoke by design</h3>
            <p>Proven frameworks adapted to your context, maturity and constraints, with usable tools and clear choices.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Partners who stay involved</h3>
            <p>Direct access to our partners, with continuity and accountability throughout the engagement.</p>
          </div>
          <div>
            <span>04</span>
            <h3>Built for adoption</h3>
            <p>Attention to observable behaviour, operating rhythms and ownership so your teams can sustain the work.</p>
          </div>
        </div>
      </section>
      <section className="philosophy-section philosophy-detail" id="our-philosophy" aria-labelledby="philosophy-detail-heading">
        <div className="wrap philosophy-grid">
          <div className="philosophy-mark">
            <img src="/assets/woy-mark.png" width="1024" height="1024" alt="WOY emblem combining circle, star and compass" />
            <p className="eyebrow red">Our name. Our philosophy.</p>
            <h2 id="philosophy-detail-heading">Win Over Yourself.</h2>
          </div>
          <div className="philosophy-detail-copy">
            <div className="philosophy-detail-introduction">
              {philosophyDetailIntroduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {brandPhilosophy.map((item) => (
              <article className="symbol-explanation" key={item.id}>
                <div className="philosophy-pillar-top">
                  <span className="philosophy-icon" aria-hidden="true">
                    <span className={`logo-symbol ${item.id}`} />
                  </span>
                  <span className="symbol-label">{item.symbol}</span>
                </div>
                <h3>{item.detailTitle}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
            <TextLink href="/work">See our approach in practice</TextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
