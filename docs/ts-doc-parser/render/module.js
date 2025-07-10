const { getModuleDesc, getModuleTitle, getModuleGroups, getNode } = require('../converter');
const { KIND } = require('../enum');
const { renderFunction } = require('./function');
const { renderVariable } = require('./variable');
const { renderEnum } = require('./enum');
const { hx } = require('./utils');

function renderModuleHeader(node, project) {
  const subTitle = getModuleTitle(node);
  const title = hx(1, `${node.name} ${subTitle}`);
  const desc = getModuleDesc(node);
  return `${title}\n${desc}`;
}

function renderModuleFile(node, project) {
  const header = renderModuleHeader(node, project);
  let content = header;
  const push = (x) => (content = x ? `${content}\n${x}` : content);
  const context = { ...project, level: 2 };
  const groups = getModuleGroups(node);
  const children = groups.children || groups || [];
  children.forEach((group) => {
    if (group.kind === KIND.Variable) {
      push(hx(2, '常量'));
    }

    if (group.kind === KIND.Enum) {
      push(hx(2, '枚举'));
    }

    group.children.forEach((id) => {
      const node = getNode(project, id);
      if (group.kind === KIND.Variable) {
        push(renderVariable(node, { ...context, level: 3 }));
      }

      if (group.kind === KIND.Enum) {
        push(renderEnum(node, { ...context, level: 3 }));
      }

      if (group.kind === KIND.Function) {
        push(renderFunction(node, context));
      }
    });
  });
  return content;
}

module.exports = {
  renderModuleFile,
};
