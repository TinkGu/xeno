const path = require('path');
const fs = require('fs-extra');
const { getModuleDesc } = require('./converter');
const { renderModuleFile } = require('./render/module');
const { mergeCoreModules } = require('./merge-core');

function draftModules(project) {
  const moduleList = mergeCoreModules(project).map((x) => ({
    ...x,
    desc: x.desc || getModuleDesc(x),
  }));

  return moduleList.map((x) => ({
    path: path.join(project.paths.outPath, `modules/${x.name}.md`),
    content: renderModuleFile(x, project),
  }));
}

function generateFiles(files) {
  files.forEach((x) => {
    fs.outputFileSync(x.path, x.content);
  });
}

module.exports = {
  draftModules,
  generateFiles,
};
