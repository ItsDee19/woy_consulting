// Compiles a TypeScript module and loads it in THIS realm, so assert.deepStrictEqual and
// prototypes behave normally. Pass every relative or aliased import in `imports`.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..", "..");

function loadTs(file, imports = {}) {
  const filename = path.join(root, file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const requireOriginal = compiled.require.bind(compiled);
  compiled.require = (specifier) => (Object.hasOwn(imports, specifier) ? imports[specifier] : requireOriginal(specifier));
  compiled._compile(output, filename);
  return compiled.exports;
}

module.exports = { loadTs, root };
