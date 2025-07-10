const { getNodeHeaderRender, renderParamTable } = require('./common');
const { getComment } = require('../converter');
const { renderType } = require('./type-signature');

function renderTypeSignature(node) {
  if (!node?.type) {
    return 'unkown';
  }
  return renderType(node) || 'unkown';
}

/** 类似渲染参数列表 */
function renderVariable(node, context) {
  const { name, source } = getNodeHeaderRender(node, context);
  const comment = getComment(node);
  return renderParamTable({
    className: 'ttd-variable-table-row',
    paramName: name,
    paramNameExtra: source,
    paramType: renderTypeSignature(node),
    paramDesc: comment,
  });
}

module.exports = {
  renderVariable,
};
