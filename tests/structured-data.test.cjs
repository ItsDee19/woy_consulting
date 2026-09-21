const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
function loadSource(file, imports = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(source, {
    module: compiledModule, exports: compiledModule.exports, URL,
    require: (specifier) => Object.hasOwn(imports, specifier) ? imports[specifier] : require(specifier),
  }, { filename: file });
  return compiledModule.exports;
}
const content = loadSource("lib/content.ts");
const schema = loadSource("lib/structured-data.ts", {
  "@/lib/content": content,
  "@/lib/site-url": { siteUrl: "https://www.woy.test" },
});
const { StructuredData } = loadSource("components/StructuredData.tsx", { "@/lib/structured-data": schema });
const plain = (value) => JSON.parse(JSON.stringify(value));

test("structured data cannot escape the script element and preserves its original text", () => {
  const hostile = '</script><script>alert("unexpected")</script><!-- & > \u2028\u2029';
  const nodes = [{ "@type": "WebPage", name: hostile }];
  const html = renderToStaticMarkup(React.createElement(StructuredData, { nodes, id: "page-data" }));
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.equal((html.match(/<\/script>/g) || []).length, 1);
  assert.ok(!html.includes("<!--"));
  const payload = html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"));
  assert.deepEqual(JSON.parse(payload), { "@context": "https://schema.org", "@graph": nodes });
});

test("schema IDs and breadcrumbs stay on the canonical origin", () => {
  assert.equal(schema.schemaId("/case-studies/example", "case-study"), "https://www.woy.test/case-studies/example#case-study");
  for (const input of ["https://evil.test/", "//evil.test/", "/\\evil.test/", "javascript:alert(1)", "relative-path"]) {
    assert.throws(() => schema.schemaUrl(input));
  }
  const graph = schema.contentPageGraph({ path: "/case-studies/example", name: "An example", description: "Visible description" }, [
    { name: "Case Studies", path: "/case-studies" },
  ]);
  assert.equal(graph[0].breadcrumb["@id"], graph[1]["@id"]);
  assert.deepEqual(plain(graph[1].itemListElement), [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.woy.test/" },
    { "@type": "ListItem", position: 2, name: "Case Studies", item: "https://www.woy.test/case-studies" },
    { "@type": "ListItem", position: 3, name: "An example", item: "https://www.woy.test/case-studies/example" },
  ]);
});

test("visible services and practitioners share the site entity without invented details", () => {
  const [organization, website] = schema.siteEntityGraph();
  assert.equal(website.publisher["@id"], organization["@id"]);
  assert.equal(organization.email, "hello@woyconsulting.com");
  for (const unsupported of ["address", "telephone", "aggregateRating", "sameAs"]) assert.ok(!(unsupported in organization));
  const services = schema.serviceGraph();
  assert.equal(services.length, content.capabilities.length);
  for (const service of services) {
    const capability = content.capabilities.find((item) => service.url.endsWith(`#${item.slug}`));
    assert.ok(capability);
    assert.equal(service.name, capability.title);
    assert.equal(service.description, capability.summary);
    assert.equal(service.provider["@id"], organization["@id"]);
    assert.equal(service.url, `https://www.woy.test/#${capability.slug}`);
    assert.equal(service["@id"], service.url);
    assert.equal(service.mainEntityOfPage["@id"], "https://www.woy.test/#webpage");
  }
  const people = schema.practitionerGraph();
  assert.equal(people.length, content.practitioners.length);
  for (const person of people) {
    const practitioner = content.practitioners.find((item) => person.url.endsWith(`#${item.slug}`));
    assert.ok(practitioner);
    assert.equal(person.name, practitioner.name);
    assert.equal(person.affiliation["@id"], organization["@id"]);
    if (!practitioner.linkedin) assert.ok(!("sameAs" in person));
    if (!practitioner.photo) assert.ok(!("image" in person));
    assert.ok(!("hasCredential" in person));
  }
});

test("case-study listing and detail graphs identify the same published works without naming confidential clients", () => {
  const list = schema.caseStudyListSchema();
  for (const [index, study] of content.caseStudies.entries()) {
    const work = schema.caseStudySchema(study);
    const listed = list.itemListElement[index].item;
    assert.equal(listed["@id"], work["@id"]);
    assert.equal(listed.url, work.url);
    assert.equal(work.description, study.context);
    assert.equal(work.about.name, study.industry);
    for (const unsupported of ["customer", "sponsor", "datePublished", "dateModified", "review", "aggregateRating"]) assert.ok(!(unsupported in work));
  }
});
