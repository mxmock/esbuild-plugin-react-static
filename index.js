import path from "path";
import React from "react";
import fs from "node:fs/promises";
import htmlMinifier from "html-minifier";
import ReactDOMServer from "react-dom/server";

const { minify } = htmlMinifier;
const { renderToString } = ReactDOMServer;
const { readFile, writeFile, cp, readdir } = fs;

const CURRENT_DIR = process.cwd();

const stringFilled = (s) => typeof s === "string" && s.length > 0;

const getFilesPath = async (dir) => {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesPath(res) : res;
    })
  );
  return Array.prototype.concat(...files);
};

const readPages = async (filesPaths) => {
  let pages = [];
  try {
    const pagesPromises = filesPaths.map(async (filePath) => {
      return new Promise((resolve, reject) => {
        readFile(filePath, "utf8")
          .then((c) => {
            if (!c) reject(`Can't read file ${filePath}`);
            const content = minify(c, {
              caseSensitive: true,
              collapseWhitespace: true,
              conservativeCollapse: true,
            });
            resolve({ path: filePath, content });
          })
          .catch((e) => reject(e));
      });
    });
    pages = await Promise.all(pagesPromises);
  } catch (e) {
    console.error(`Can't read files`, e.message);
  } finally {
    return pages;
  }
};

const getIdFromFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const name = fileName.substring(0, fileName.indexOf(".static"));
  return `${name.slice(0, 1).toLowerCase()}${name.slice(1)}`;
};

const getUpdatedPages = (opt) => {
  const { content, attrData, attrId, componentPath, suffix, redux } = opt;
  const idLocation = content.indexOf(attrId);
  const data = getComponentData(content, idLocation, attrData);
  const html = getComponentHtml(componentPath, data, suffix, redux);
  return getInjectedHtml(html, content, idLocation, attrId.length);
};

const getComponentData = (content, idLocation, attrData) => {
  if (!content.includes(attrData)) return {};
  const dataStartAt = content.indexOf(attrData) + attrData.length + 1;
  const dataEndAt = idLocation - 2;
  const data = content.substring(dataStartAt, dataEndAt);
  try {
    const parsed = JSON.parse(data);
    console.log(`${attrData}`, parsed);
    return parsed;
  } catch (e) {
    console.error(`Can't parse ${data} from html:`, e.message);
    return {};
  }
};

const getComponentHtml = async (path, data, suffix, redux) => {
  let Component = await import(path);
  if (Component.default) Component = Component.default;
  const reactComponent = React.createElement(Component, { data });
  if (suffix.includes("provider")) {
    if (redux.store && redux.Provider) {
      const { store, Provider } = redux;
      return renderToString(
        React.createElement(Provider, { store }, reactComponent)
      );
    } else {
      throw new Error(`You must provide a store and Provider for ${path}`);
    }
  } else {
    return renderToString(reactComponent);
  }
};

const getInjectedHtml = (component, page, idLocation, idSize) => {
  const beforeId = page.substring(0, idLocation + idSize);
  const afterId = page.substring(idLocation + idSize);
  return `${beforeId}${component}${afterId}`;
};

module.exports = (options = {}) => {
  const outDir = stringFilled(options.outDir)
    ? `${CURRENT_DIR}/${options.outDir}`
    : `${CURRENT_DIR}/out`;
  const pagesPath = stringFilled(options.pages)
    ? `${CURRENT_DIR}/${options.pages}`
    : null;
  const redux = options.redux || { store: null, Provider: null };

  let pages = [];

  return {
    name: "reactStaticPlugin",
    setup: (build) => {
      build.onStart(async () => {
        try {
          if (!pagesPath) throw new Error(`Must specify a html page`);
          await cp(pagesPath, outDir, { recursive: true });
          const filesPaths = await getFilesPath(outDir);
          pages = await readPages(filesPaths);
        } catch (e) {
          console.error(`Can't get html outputs paths`, e.message);
        }
      });

      build.onLoad({ filter: /\.static.jsx$/ }, (args) => {
        const componentPath = args.path;

        const id = getIdFromFile(componentPath);
        const attrId = `id="${id}">`;
        const attrData = `data-${id}=`;

        for (const page of pages) {
          let { content, path } = page;
          if (!content.includes(attrId)) continue;
          const opt = {
            redux,
            attrId,
            content,
            attrData,
            componentPath,
            suffix: args.suffix,
          };
          page.content = getUpdatedPages(opt);
          console.log("Component:", id);
          console.log("Injected in:", path);
          console.log("-------------------------------------------");
          console.log("-------------------------------------------");
        }

        return { loader: "jsx" };
      });

      build.onEnd(async () => {
        for (const page of pages) {
          await writeFile(page.path, page.content);
        }
      });
    },
  };
};
