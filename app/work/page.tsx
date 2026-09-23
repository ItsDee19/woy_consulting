import { pageMetadata } from "@/lib/metadata";
import {PageIntro,TextLink} from '@/components/recreation/Site';
import {WorkFilter} from '@/components/recreation/WorkFilter';
import {CollectiveExperience} from '@/components/recreation/CollectiveExperience';
export const metadata = pageMetadata('Selected work', 'Explore WOY engagements in education, insurance, financial services, IT consulting, automotive and medical technology.', "/work");
export default function Work(){return <div className="recreation"><PageIntro label="Selected work" title={<>Business realities.<br/><em>Practical responses.</em></>}><p>A selection of engagements across industries. Each begins with a different challenge and a commitment to making the work useful in practice.</p><div className="work-experience-link"><TextLink href="#collective-experience">Our collective experience</TextLink></div></PageIntro><section className="wrap work-library" aria-label="Selected engagements"><WorkFilter/><p className="portfolio-note">Client identities are kept confidential in these engagement stories.</p></section><CollectiveExperience/></div>}
