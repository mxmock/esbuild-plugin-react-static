// main.jsx
var path = require("path");
var React = require("react");
var fs = require("node:fs/promises");
var ReactDOMServer = require("react-dom/server");
var { renderToString } = ReactDOMServer;
var { readFile, writeFile, cp, readdir } = fs;
var ENVS = { DEV: "development", PROD: "production" };
var ENV = process.env.NODE_ENV || ENVS.DEV;
var CURRENT_DIR = process.cwd();
var stringFilled = (s) => typeof s === "string" && s.length > 0;
var getIdFromFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const name = fileName.substring(0, fileName.indexOf(".static"));
  return `${name.slice(0, 1).toLowerCase()}${name.slice(1)}`;
};
var getComponentHtml = (path2) => {
  let Component = require(path2);
  if (Component.default) Component = Component.default;
  return renderToString(/* @__PURE__ */ React.createElement(Component, null));
};
var getInjectedHtml = (component, page, id) => {
  const idLocation = page.indexOf(id) + id.length + 2;
  const beforeId = page.substring(0, idLocation);
  const afterId = page.substring(idLocation);
  return `${beforeId}${component}${afterId}`;
};
var injectInHtml = async (html, page, id) => {
  try {
    const final = getInjectedHtml(html, page.content, id);
    await writeFile(page.path, final);
  } catch (e) {
    console.log(e.message);
  }
};
module.exports = (options = {}) => {
  const outDir = stringFilled(options.outDir)
    ? `${CURRENT_DIR}/${options.outDir}`
    : `${CURRENT_DIR}/out`;
  const pagesPath = stringFilled(options.pages)
    ? `${CURRENT_DIR}/${options.pages}`
    : null;
  let pages = [];
  return {
    name: "reactStaticPlugin",
    setup: (build) => {
      build.onStart(async () => {
        try {
          if (!pagesPath) throw new Error(`Must specify a html page`);
          await cp(pagesPath, outDir, { recursive: true });
          const files = await readdir(pagesPath);
          const pagesPromises = files.map(async (file) => {
            return new Promise((resolve, reject) => {
              const path2 = `${outDir}/${file}`;
              readFile(path2, "utf8")
                .then((content) => {
                  if (!content) reject(`Can't read file ${file}`);
                  resolve({ path: path2, content });
                })
                .catch((e) => reject(e));
            });
          });
          pages = await Promise.all(pagesPromises);
        } catch (e) {
          console.log(e.message);
        }
      });
      build.onLoad({ filter: /\.static.jsx$/ }, async (args) => {
        const componentPath = args.path;
        const html = getComponentHtml(componentPath);
        const id = getIdFromFile(componentPath);
        if (ENV === ENVS.PROD) {
          pages.forEach(async (page) => {
            if (page.content.includes(`id="${id}"`)) {
              console.log("component : ", id);
              console.log("injected in : ", page.path);
              console.log("---------------------------");
              console.log("---------------------------");
              await injectInHtml(html, page, id);
            }
          });
        }
        return {
          loader: "jsx",
        };
      });
    },
  };
};
