import * as esbuild from "esbuild";
import htmlPlugin from "../index.js";
import { writeFile } from "node:fs/promises";

const OUT_DIR = "test/prod";
const PAGES_FROM = "test/src/pages";
const JS_FROM = "test/src/main.jsx";

const TIME_LOG = `Build time`;

console.time(TIME_LOG);
const result = await esbuild.build({
  entryPoints: [JS_FROM],
  bundle: true,
  minify: true,
  plugins: [htmlPlugin({ outDir: `${OUT_DIR}/pages`, pages: PAGES_FROM })],
  outdir: `${OUT_DIR}/js`,
  metafile: true,
  legalComments: "none",
  pure: ["console"],
});
console.timeEnd(TIME_LOG);

await writeFile("meta.json", JSON.stringify(result.metafile));
