const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./helpers/load-ts.cjs");

const assets = loadTs("lib/cms/assets.ts");
const image = "https://cdn.sanity.io/images/abc123xy/production/6f1e2d-1200x800.jpg";
const file = "https://cdn.sanity.io/files/abc123xy/production/9a8b7c.pdf";

test("Sanity asset URLs become same-origin /cms-assets paths", () => {
  assert.equal(assets.cmsAssetPath(image), "/cms-assets/images/6f1e2d-1200x800.jpg");
  assert.equal(assets.cmsAssetPath(file), "/cms-assets/files/9a8b7c.pdf");
  for (const hostile of ["https://evil.test/images/a/b/c.jpg", "http://cdn.sanity.io/images/a/production/c.jpg", "https://cdn.sanity.io/images/abc/production/../x.jpg", "https://cdn.sanity.io/images/abc/production/a/b.jpg", "/cms-assets/images/x.jpg"]) {
    assert.throws(() => assets.cmsAssetPath(hostile), /Unexpected Sanity asset URL/, hostile);
  }
});

test("object-position and hotspots round-trip without floating-point noise", () => {
  for (const position of ["50% 26%", "52% 15%", "48% 8%", "50% 0%", "100% 100%"]) {
    assert.equal(assets.objectPositionFromHotspot(assets.hotspotFromObjectPosition(position)), position);
  }
  assert.deepEqual(assets.hotspotFromObjectPosition("50% 26%"), { x: 0.5, y: 0.26 });
  assert.equal(assets.objectPositionFromHotspot(null), "50% 50%");
  assert.throws(() => assets.hotspotFromObjectPosition("center top"), /Unsupported object-position/);
});

test("downloads stay same-origin, encode awkward names and survive missing metadata", () => {
  const download = assets.toFileDownload({ url: file, originalFilename: "WOY Brochure – 2026 (final).pdf", extension: "PDF", size: 1_572_864 }, "Download");
  assert.equal(download.href, "/cms-assets/files/9a8b7c.pdf?dl=WOY%20Brochure%20%E2%80%93%202026%20(final).pdf");
  assert.deepEqual({ ...download, href: undefined }, { href: undefined, label: "Download", fileName: "WOY Brochure – 2026 (final).pdf", extension: "pdf", size: 1_572_864 });
  const bare = assets.toFileDownload({ url: file, originalFilename: null, extension: null, size: null }, "Download");
  assert.equal(bare.fileName, "document");
  assert.equal(bare.extension, "file");
  assert.equal(bare.size, 0);
  assert.equal(assets.toDownload(null, "x"), undefined);
  assert.equal(assets.toDownload({ label: "Read", file: null }, "x"), undefined);
  assert.equal(assets.toDownload({ label: "  ", file: { url: file, originalFilename: "a.pdf", extension: "pdf", size: 10 } }, "Fallback").label, "Fallback");
});

test("file sizes read naturally and never show zero or NaN", () => {
  assert.equal(assets.formatFileSize(0), "");
  assert.equal(assets.formatFileSize(Number.NaN), "");
  assert.equal(assets.formatFileSize(-5), "");
  assert.equal(assets.formatFileSize(900), "900 B");
  assert.equal(assets.formatFileSize(2048), "2 KB");
  assert.equal(assets.formatFileSize(1_572_864), "1.5 MB");
});
