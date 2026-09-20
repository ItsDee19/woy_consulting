import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { site } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Practitioner-led leadership advisory`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Practitioner-led leadership advisory`,
    description: site.description,
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#CD1421" stroke-width="7"><circle cx="50" cy="54" r="34"/><path d="M50 54v-25M50 54h25M50 54H25M50 54l-16 19M50 54l16 19"/></g><path d="M45 12h10l-5-8z" fill="#CD1421"/></svg>`
          ),
      },
    ],
  },
};

/* Runs before first paint. Sets the saved theme so there is no flash, and
   marks the document as scripted, which is what arms the scroll reveals. If
   this never runs, revealed content simply renders visible. */
const bootScript = `
(function(){
  var d=document.documentElement;
  d.setAttribute('data-js','');
  try{
    var t=localStorage.getItem('woy-theme');
    if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
    d.setAttribute('data-theme',t);
  }catch(e){d.setAttribute('data-theme','light');}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-6 top-[-100px] z-[100] rounded-[2px] bg-red px-4 py-3 text-sm font-medium text-white transition-all focus:top-4"
        >
          Skip to content
        </a>

        <ScrollProgress />
        <Nav />
        <main id="main">{children}</main>
        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: site.name,
              slogan: site.principle,
              description: site.description,
              foundingDate: String(site.established),
              areaServed: "IN",
            }),
          }}
        />
      </body>
    </html>
  );
}
