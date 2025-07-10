const { getNodeHeaderRender, renderParamTable } = require('./common');
const { getComment } = require('../converter');
const { span } = require('./utils');

function renderEnumMembers(node, context) {
  if (!node?.children?.length) {
    return '';
  }
  return node.children
    .map((x) => {
      return span('ttd-enum-member-row', [
        '+ ',
        span('ttd-enum-member-name', x.name),
        ' = ',
        span('ttd-enum-member-value', x.defaultValue || x.value),
        span('ttd-enum-member-comment', getComment(x)),
      ]);
    })
    .join('');
}

/** 渲染枚举列表 */
function renderEnum(node, context) {
  const { name, source } = getNodeHeaderRender(node, context);
  const comment = getComment(node);
  const members = renderEnumMembers(node, context);
  return renderParamTable({
    className: 'ttd-enum-table-row',
    paramName: name,
    paramNameExtra: source,
    paramType: '',
    paramDesc: span('', [comment ? span('ttd-enum-comment', comment) : '', members]),
  });
}

module.exports = {
  renderEnum,
};
