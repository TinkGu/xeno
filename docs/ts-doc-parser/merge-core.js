const fileMap = require('../../scripts/file-map');
const { getAllModules, getNodeTag } = require('./converter');
const { KIND } = require('./enum');

function mergeModule(a, b) {
  a.children = (a.children || []).concat(b.children);
  a.groups = (a.groups || []).concat(b.groups);
  const newGroups = [];
  const cached = {};
  a.groups.forEach((x) => {
    if (cached[x.kind] !== undefined) {
      const index = cached[x.kind];
      newGroups[index].children = newGroups[index].children.concat(x.children);
    } else {
      newGroups.push(x);
      cached[x.kind] = newGroups.length - 1;
    }
  });
  a.groups = newGroups;
}

/** 合并一些核心模块，只处理非 fileMap 中的 */
function mergeCoreModules(project) {
  const modules = Object.values(getAllModules(project));
  let newList = [];
  const coreModule = {
    id: 'core',
    name: 'core',
    desc: '核心',
    kind: KIND.Module,
    children: [],
    groups: [],
  };

  modules.forEach((x) => {
    if (fileMap.includes(x.name)) {
      newList.push(x);
      return;
    }

    const isSideMenu = getNodeTag(x, 'sidemenu');
    if (isSideMenu) {
      newList.push(x);
      return;
    }

    mergeModule(coreModule, x);
  });

  newList = [coreModule].concat(newList);

  return newList;
}

module.exports = {
  mergeCoreModules,
};
