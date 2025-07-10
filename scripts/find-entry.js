const fs = require('fs');
const path = require('path');
const fileMap = require('./file-map');

/** 获取模块在 src 目录下的文件名地址，具体到 xx/index.ts */
function getRelativePath(name) {
  const srcPath = path.join(__dirname, '../src');
  const dirName = `${name}/index.ts`;
  const fileName = `${name}.ts`;
  let pathName = dirName;
  if (!fs.existsSync(path.join(srcPath, dirName))) {
    pathName = fileName;
  }
  return `./${path.join('src', pathName)}`;
}

/** 通过 filemap，查找子包 */
function findByFileMap() {
  return fileMap.map((x) => getRelativePath(x));
}

let entryFileBuffer = '';

/** 通过 index.ts 文件，查找对应的子文件 */
function findByIndexExports(options) {
  const exportEntries = [options.withIndexSelf ? './src/index.ts' : ''];
  if (!entryFileBuffer) {
    entryFileBuffer = fs.readFileSync(path.join(__dirname, '../src/index.ts'));
  }
  const lines = entryFileBuffer.toString().split('\n');
  lines.forEach((line) => {
    // 简单处理，只识别 export 语句
    if (!line.startsWith('export')) {
      return;
    }
    const strs = line.split("'");
    const filename = strs[1];
    if (!filename) {
      return;
    }
    exportEntries.push(getRelativePath(filename));
  });
  return exportEntries.filter((x) => x !== '');
}

module.exports = {
  findByIndexExports,
  findByFileMap,
};
