const { getNodeTag } = require('../converter');
const { span, link, hx, div } = require('./utils');

/** 渲染节点类型标记 */
function renderKindString(node) {
  return span('ttd-kind-badge', node.kindString);
}

const githubSvgIcon = `<svg aria-hidden="true" height="24" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true" class="octicon octicon-mark-github"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>`;

/** 渲染源代码所在 */
function renderSourceDefine(node, context) {
  const { repoUrl } = context.paths;
  const { fileName, line } = node.sources?.[0] || {};
  if (!fileName || !repoUrl) {
    return '';
  }
  const sourceLink = link('', span('ttd-source-badge', githubSvgIcon), {
    href: `${repoUrl}/blob/master/${fileName}#${line}`,
    title: '点击查看源码',
  });
  return span('ttd-source-define', sourceLink);
}

/** 渲染已废弃标记 */
function renderDeprecatedTag() {
  return span('ttd-deprecated-badge', '');
}

/** 渲染节点 Header，一般比较通用 */
function getNodeHeaderRender(node, context, options) {
  const { level } = context;
  const htag = hx(level);
  const rawName = node.name;
  const source = renderSourceDefine(node, context);
  const isDeprecated = getNodeTag(node, 'deprecated');
  const deprecated = isDeprecated ? renderDeprecatedTag() : '';
  const name = isDeprecated ? span('ttd-deprecated-name', rawName) : rawName;
  return {
    htag,
    source,
    deprecated,
    name,
  };
}

/** 渲染参数列表 */
function renderParamTable({ className, paramName, paramNameExtra, paramDesc, paramType }) {
  return div(
    ['ttd-param-table-row', className],
    [
      span('ttd-param-name-box', [span('ttd-param-name', paramName), span('ttd-param-name-extra', paramNameExtra)]),
      span('ttd-param-desc-box', [span('ttd-param-type ttd-sig', paramType), span('ttd-param-desc', paramDesc)]),
    ],
  );
}

module.exports = {
  renderKindString,
  renderSourceDefine,
  getNodeHeaderRender,
  renderParamTable,
};
