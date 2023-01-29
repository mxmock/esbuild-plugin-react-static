const path = require("path");
const React = require("react");
const fs = require("node:fs/promises");
const ReactDOMServer = require("react-dom/server");

const { renderToString } = ReactDOMServer;
const { readFile, writeFile, cp, readdir } = fs;

const CURRENT_DIR = process.cwd();

const stringFilled = (s) => typeof s === "string" && s.length > 0;

const getIdFromFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const name = fileName.substring(0, fileName.indexOf(".static"));
  return `${name.slice(0, 1).toLowerCase()}${name.slice(1)}`;
};

const getComponentHtml = (path) => {
  let Component = require(path);
  if (Component.default) Component = Component.default;
  return renderToString(<Component />);
};

const getInjectedHtml = (component, page, id) => {
  const idLocation = page.indexOf(id) + id.length + 2;
  const beforeId = page.substring(0, idLocation);
  const afterId = page.substring(idLocation);
  return `${beforeId}${component}${afterId}`;
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
              const path = `${outDir}/${file}`;
              readFile(path, "utf8")
                .then((content) => {
                  if (!content) reject(`Can't read file ${file}`);
                  resolve({ path, content });
                })
                .catch((e) => reject(e));
            });
          });

          pages = await Promise.all(pagesPromises);
        } catch (e) {
          console.log(e.message);
        }
      });

      build.onLoad({ filter: /\.static.jsx$/ }, (args) => {
        const componentPath = args.path;

        const html = getComponentHtml(componentPath);
        const id = getIdFromFile(componentPath);

        pages.forEach((page) => {
          if (page.content.includes(`id="${id}"`)) {
            console.log("Component:", id);
            console.log("Injected in:", page.path);
            console.log("-------------------------------------------");
            console.log("-------------------------------------------");
            page.content = getInjectedHtml(html, page.content, id);
          }
        });

        return { loader: "jsx" };
      });

      build.onEnd(async () => {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          await writeFile(page.path, page.content);
        }
      });
    },
  };
};
