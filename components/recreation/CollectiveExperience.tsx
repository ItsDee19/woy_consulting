/* eslint-disable @next/next/no-img-element -- Preserve the source artwork dimensions and display-only crop calculations. */
import {experienceLogos,homepageLogoIds,type ExperienceLogo} from '@/lib/recreation-experience-logos';
import {recreationLogoAssets} from '@/lib/recreation-logo-assets';
import {TextLink} from '@/components/recreation/Site';

function LogoArtwork({logo}:{logo:ExperienceLogo}){
  const [x,y,width,height]=logo.crop;
  return <li className="experience-logo" title={logo.name}>
    <span className="experience-logo-art" style={{width:`min(100%, ${logo.displayWidth}px)`,aspectRatio:`${width} / ${height}`}}>
      <img src={logo.src} alt={logo.name} width={logo.width} height={logo.height} loading="lazy" decoding="async" style={{width:`${logo.width/width*100}%`,left:`${-x/width*100}%`,top:`${-y/height*100}%`}}/>
    </span>
  </li>;
}

export function CollectiveExperience({featured=false}:{featured?:boolean}){
  const logos=featured ? homepageLogoIds.map(id=>experienceLogos.find(logo=>logo.id===id)!) : experienceLogos;
  return <section id="collective-experience" className={`collective-experience${featured?' experience-featured':''}`} aria-labelledby="collective-experience-title">
    <div className="wrap experience-inner">
      <div className="experience-heading">
        <h2 id="collective-experience-title">Our collective experience</h2>
        <p>Organisations that WOY and its practitioners have supported through direct assignments and engagements delivered with partner and affiliate platforms.</p>
      </div>
      <ul className="experience-logo-grid" aria-label="Organisations supported by WOY and its practitioners">
        {logos.map(logo=><LogoArtwork logo={{...logo, ...recreationLogoAssets[logo.id as keyof typeof recreationLogoAssets]}} key={logo.id}/>)}
      </ul>
      {featured&&<div className="experience-more"><TextLink href="/work#collective-experience">View all organisations</TextLink></div>}
    </div>
  </section>;
}
