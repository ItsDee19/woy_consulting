import type { Metadata } from "next";
import "./globals.css";
import "./recreation.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollProgress } from "@/components/ScrollProgress";
import { site } from "@/lib/content";
import { isIndexable, siteUrl } from "@/lib/site-url";
import { pageMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { siteEntityGraph } from "@/lib/structured-data";

export const metadata: Metadata = {
  ...pageMetadata("Practitioner-led Leadership Advisory", site.description, "/"),
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Practitioner-led Leadership Advisory`,
    template: `%s | ${site.name}`,
  },
  // Do not inherit a homepage canonical for missing or unmatched routes.
  alternates: undefined,
  robots: isIndexable ? {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  } : { index: false, follow: false },
};

/* Runs before first paint. Sets the saved theme so there is no flash, and
   marks the document as scripted, which is what arms the scroll reveals. If
   this never runs, revealed content simply renders visible. */
const bootScript = `
(function(){
  var d=document.documentElement;
  d.setAttribute('data-js','');
  try{
    var c=JSON.parse(localStorage.getItem('woy-cookie-preferences')||'null');
    var valid=c&&c.version===1&&typeof c.updatedAt==='string'&&typeof c.preferences==='boolean';
    if(valid){d.setAttribute('data-cookie-choice','saved');}
    var t=valid&&c.preferences===true?localStorage.getItem('woy-theme'):null;
    if(t!=='light'&&t!=='dark'){t=null;}
    if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
    d.setAttribute('data-theme',t);
  }catch(e){d.setAttribute('data-theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-6 top-[-100px] z-[100] rounded-[2px] bg-action px-4 py-3 text-sm font-medium text-white transition-all focus:top-4"
        >
          Skip to content
        </a>

        <ScrollProgress />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />

        <StructuredData id="site-structured-data" nodes={siteEntityGraph()} />

      </body>
    </html>
  );
}
