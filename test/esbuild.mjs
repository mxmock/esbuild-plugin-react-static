import * as esbuild from "esbuild";
import htmlPlugin from "../index.js";
import { Provider } from "react-redux";
import store from "./src/redux/store.js";

const OUT_DIR = "test/build";
const PAGES_FROM = "test/src/pages";
const JS_FROM = "test/src/main.jsx";
const REDUX = { store, Provider };

const ctx = await esbuild.context({
  entryPoints: [JS_FROM],
  bundle: true,
  plugins: [
    htmlPlugin({ outDir: `${OUT_DIR}/pages`, pages: PAGES_FROM, redux: REDUX }),
  ],
  outdir: `${OUT_DIR}/js`,
});

await ctx.watch();
