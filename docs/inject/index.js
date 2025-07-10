/** 为文档站注入全局变量 */
const fs = require('fs');
const path = require('path');
const filemap = require('../../scripts/file-map');

const resolveToCamel = (str) => {
  return str.replace(/-(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
};

function buildInjectScripts() {
  const scriptContent = `
import * as xeno from '../lib/esm/index';
${filemap
  .map((moduleName) => {
    return `import * as ${resolveToCamel(moduleName)} from '../lib/esm/${moduleName}';`;
  })
  .join('\n')}

window.xeno = xeno;
${filemap
  .map((moduleName) => {
    return `window.xeno.${resolveToCamel(moduleName)} = ${moduleName};`;
  })
  .join('\n')}
`;
  fs.writeFileSync(path.resolve(__dirname, '../inject.dist.js'), scriptContent);
}

buildInjectScripts();
