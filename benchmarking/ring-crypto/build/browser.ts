import * as fs from "fs";
import * as path from "path";
import * as rollup from "rollup";
import * as resolve from "rollup-plugin-node-resolve";
import * as rollupConfig from "@root/rollup.config.js";
import { envIndexReplace } from "./processing/env-index-replace";
import * as Terser from "terser";
import { srcRoot as getSrcRoot, browserRoot } from "./utility/app-root";

const srcRoot = getSrcRoot();
const root = browserRoot();

envIndexReplace(root, "browser/env-index", (err) => {
    if (err) {
        console.log(err);
        return;
    }
});

rollupConfig.plugins.splice(0, 0,
resolve({
  browser: true,
  preferBuiltins: false
}));

rollupConfig.inputs.push({
  inputOptions: {
      input: `${root}/src/index.js`
  },
  outputOptions: {
      file: "dist/bundle.browser.js",
      name: "ringCrypto",
      format: "esm"
  }
});

const browserFix = `var global = typeof global !== 'undefined' ? global : self;`;
const bufferFix = `global["Buffer"] = typeof Buffer !== 'undefined' ? Buffer : Buffer$1;`;
async function loop(i, inputConfig) {
  if (i === inputConfig.inputs.length) {
    return;
  }

  const config = inputConfig.inputs[i];
  const inputOptions = config.inputOptions;
  inputOptions.plugins = inputConfig.plugins;

  const outputOptions = config.outputOptions;
  outputOptions.globals = inputConfig.globals;

  async function build() {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);
    // generate code and a sourcemap
    const { code, map } = await bundle.generate(outputOptions);
    // or write the bundle to disk
    await bundle.write(outputOptions);

    // This fixes the bundle for use in the browser
    const filename = outputOptions.file;
    let file = fs.readFileSync(`${filename}`).toString();
    file = file.replace("(function (global, factory) {", `(function (global, factory) {${browserFix}`);
    file = file.replace("}(this, (function () { 'use strict';", `}(this, (function () { 'use strict';${browserFix}`);
    file = file.replace("function Buffer$1 (arg, encodingOrOffset, length) {", `${bufferFix}function Buffer$1 (arg, encodingOrOffset, length) {`);

    let buf;
    // Minify
    const min = Terser.minify(file);
    buf = Buffer.from(min.code);
    fs.writeFileSync(`${filename.replace('.js', '.min.js')}`, buf);
    // Don't minify
    buf = Buffer.from(file);
    fs.writeFileSync(`${filename}`, buf);

  }
  await build();
  await loop(i + 1, inputConfig);
}

// Config
let buildType = "all";
for (let i = 1; i < process.argv.length; i++) {
  const arg = process.argv[i];
  switch (arg) {
  }
}

if (buildType === "all") {
  loop(0, rollupConfig);
}
