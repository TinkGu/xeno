const { KIND } = require('../enum');
const { getComment } = require('../converter');
const { getNodeHeaderRender, renderParamTable } = require('./common');
const { span, popup } = require('./utils');
const { renderFnTypeSignature, renderType } = require('./type-signature');

/**
 * 渲染普通注释
 */
function renderComment(node) {
  return node.nodeComment || '';
}

/** 只展开渲染有额外注释、原地书写类型的参数 */
function renderParamList(node, context, options) {
  options = options || {};
  const params = [];
  node.nodeParameters.forEach((x) => {
    let shouldShowParam = false;
    let hasSubProps = false;
    const paramType = x.type?.type;
    const comment = getComment(x);
    const optional = x.isOptional ? span('ttd-sig-param-optional', '?') : '';
    const name = span('ttd-sig-param-name', x.name);
    const type = renderType(x, options);

    if (paramType === 'reflection') {
      const typeKind = x.type?.declaration?.kind;
      if (typeKind === KIND.TypeLiteral) {
        shouldShowParam = true;
        hasSubProps = true;
      }
    }

    if (comment) {
      shouldShowParam = true;
    }

    if (shouldShowParam) {
      params.push(
        renderParamTable({
          className: 'ttd-fn-param-table-row',
          paramName: name + optional,
          paramType: type,
          paramDesc: comment,
        }),
      );
    }

    if (hasSubProps) {
      const props = x.type?.declaration?.children;
      if (props?.length) {
        props.forEach((prop) => {
          const propName = prop.name;
          const propType = renderType(prop);
          const propsComment = getComment(prop);
          params.push(
            renderParamTable({
              className: 'ttd-fn-param-table-row',
              paramName: span('ttd-sig-param-name', [x.name, '.', propName]),
              paramType: propType,
              paramDesc: propsComment,
            }),
          );
        });
      }
    }
  });

  if (params.length) {
    return span('ttd-fn-param-table', params.join(''));
  }
  return '';
}

function renderExamples(node) {
  return '';
}

/** 渲染标题 */
function renderTitle(node, context) {
  const { htag, name, source } = getNodeHeaderRender(node, context);
  return `${htag}${name}${source}`;
}

/** 渲染函数节点 */
function renderFunction(node, context) {
  const comment = renderComment(node);
  return `${renderTitle(node, context)}
${renderFnTypeSignature(node)}
${comment ? '<br/>' + comment : ''}
${renderParamList(node)}
${renderExamples(node)}
`;
}

module.exports = {
  renderFunction,
};
