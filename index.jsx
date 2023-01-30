const path = require("path");
const React = require("react");
const fs = require("node:fs/promises");
const minify = require("html-minifier").minify;
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

const getComponentHtml = (path, data) => {
  let Component = require(path);
  if (Component.default) Component = Component.default;
  return renderToString(<Component data={data} />);
};

const getInjectedHtml = (component, page, idLocation, idSize) => {
  const beforeId = page.substring(0, idLocation + idSize);
  const afterId = page.substring(idLocation + idSize);
  return `${beforeId}${component}${afterId}`;
};

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
          const files = await getFilesPath(outDir);

          const pagesPromises = files.map(async (file) => {
            return new Promise((resolve, reject) => {
              readFile(file, "utf8")
                .then((content) => {
                  if (!content) reject(`Can't read file ${file}`);
                  resolve({ path: file, content });
                })
                .catch((e) => reject(e));
            });
          });

          pages = await Promise.all(pagesPromises);
        } catch (e) {
          console.error(`Can't read files`, e.message);
        }
      });

      build.onLoad({ filter: /\.static.jsx$/ }, (args) => {
        const componentPath = args.path;

        const id = getIdFromFile(componentPath);
        const attrId = `id="${id}">`;
        const attrData = `data-${id}=`;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const content = minify(page.content, {
            collapseWhitespace: true,
            conservativeCollapse: true,
            // collapseInlineTagWhitespace: true,
            caseSensitive: true,
          });

          const hasId = content.includes(attrId);

          if (hasId) {
            const idLocation = content.indexOf(attrId);
            const data = getComponentData(content, idLocation, attrData);
            const html = getComponentHtml(componentPath, data);
            page.content = getInjectedHtml(
              html,
              content,
              idLocation,
              attrId.length
            );
            console.log("Component:", id);
            console.log("Injected in:", page.path);
            console.log("-------------------------------------------");
            console.log("-------------------------------------------");
          }
        }

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
