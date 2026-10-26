const test = require("node:test");
const assert = require("node:assert/strict");
const { renderToStaticMarkup } = require("react-dom/server");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const { DownloadButton } = loadTs("components/DownloadButton.tsx", { "@/lib/cms/assets": assets });
const { ResourceList } = loadTs("app/resources/ResourceList.tsx", {
  "@/components/DownloadButton": { DownloadButton },
  "./resources.module.css": new Proxy({}, { get: (_, key) => String(key) }),
  "next/image": { __esModule: true, default: (props) => require("react").createElement("img", { src: props.src, alt: props.alt }) },
  "next/link": { __esModule: true, default: ({ href, children }) => require("react").createElement("a", { href }, children) },
});

const download = { href: "/cms-assets/files/f00d.pdf?dl=Brochure.pdf", label: "Download", fileName: "Brochure.pdf", extension: "pdf", size: 1_572_864 };

test("download links are same-origin, named and sized", () => {
  const html = renderToStaticMarkup(DownloadButton({ download }));
  assert.match(html, /href="\/cms-assets\/files\/f00d\.pdf\?dl=Brochure\.pdf"/);
  assert.match(html, /download="Brochure\.pdf"/);
  assert.match(html, /\(PDF, 1\.5 MB\)/);
  assert.doesNotMatch(renderToStaticMarkup(DownloadButton({ download: { ...download, size: 0 } })), /0 B|NaN/);
});

test("an empty library shows a friendly message instead of an empty grid", () => {
  const html = renderToStaticMarkup(ResourceList({ resources: [] }));
  assert.match(html, /New resources are on their way/);
  assert.match(html, /href="\/contact"/);
  assert.doesNotMatch(html, /<ul/);
});

test("resources list newest first as given, with category, readable date and download", () => {
  const html = renderToStaticMarkup(ResourceList({ resources: [
    { id: "a", title: "Annual report", description: "", category: "Report", date: "2026-10-01", download },
  ] }));
  // HTML attribute names are case-insensitive: React writes dateTime, browsers read it as datetime.
  assert.match(html, /Report · <time datetime="2026-10-01">1 October 2026<\/time>/i);
  assert.match(html, /Annual report/);
  assert.match(html, /cms-assets\/files/);
});
