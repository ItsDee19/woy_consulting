import { pageMetadata } from "@/lib/metadata";
import {PageIntro,PersonCard,TextLink} from '@/components/recreation/Site';
import {people} from '@/lib/recreation-content';
export const metadata = pageMetadata('Leadership & Partners', 'Meet WOY Consulting’s leadership and partners, supported by a consortium of over 10 consultants and over 25 coaches.', "/people");

export default function People(){
  const leadership=people.filter(person=>person.category==='leadership');
  const partners=people.filter(person=>person.category==='partner');
  return <div className="recreation">
    <PageIntro label="Our Leadership & Partners" title={<>Senior judgement.<br/><em>Personal commitment.</em></>}>
      <div className="people-overview">
        <p>A consortium of over 10 consultants and over 25 coaches, all former business leaders from a range of industries and disciplines.</p>
        <p>We bring the right combination of experience to each engagement, with senior involvement from the first conversation through delivery.</p>
      </div>
    </PageIntro>
    <section id="leadership" className="wrap people-section" aria-labelledby="leadership-heading">
      <div className="people-intro">
        <h2 id="leadership-heading" className="eyebrow red people-group-title">Our Leadership</h2>
        <p className="muted">The team guiding WOY’s direction and staying closely involved in client engagements.</p>
      </div>
      <div className="people-grid">{leadership.map(person=><PersonCard person={person} key={person.slug}/>)}</div>
    </section>
    {partners.length>0&&<section id="partners" className="wrap people-section people-partners" aria-labelledby="partners-heading">
      <div className="people-intro">
        <h2 id="partners-heading" className="eyebrow red people-group-title">Our Partners</h2>
        <p className="muted">Consultants and coaches bringing specialist expertise to WOY engagements.</p>
      </div>
      <div className="people-grid">{partners.map(person=><PersonCard person={person} key={person.slug}/>)}</div>
    </section>}
    <section className="wrap section people-principle"><h2>The right experience.<br/>For your context.</h2><div><p className="muted">Our work draws on business leadership, consulting, organisation transformation and executive coaching. We assemble each engagement around your priorities, with continuity from the first conversation through delivery.</p><TextLink href="/contact">Start a conversation</TextLink></div></section>
  </div>;
}
