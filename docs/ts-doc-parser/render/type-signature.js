const { span, brackets } = require('./utils');
const { KIND } = require('../enum');

/** 就地定义的 alias type */
function renderDeclarationType(decl) {
  const declName = span('ttd-sig-decl', decl.name);
  return span('ttd-sig-decl-wrapper', declName);
}

/** 复杂声明，比如 interface */
function renderReferenceType(type) {
  const isNativeModule = type?.package === 'typescript';
  const isTypeVariable = type?.name === 'T' || type?.name === 'U';
  const moreTip = isTypeVariable || isNativeModule ? '' : 'more';
  let referName = span(`ttd-sig-refer ${moreTip}`, type.name);
  /** 若含有泛型变量 */
  if (type?.typeArguments?.length) {
    const targs = [];
    type.typeArguments.forEach((x) => {
      const targ = renderType({ type: x });
      if (targ) {
        targs.push(targ);
      }
    });
    referName = `${referName}${brackets(targs.join(', '))}`;
  }
  return span('ttd-sig-refer-wrapper', referName);
}

/** 联合类型 */
function renderUnion(type) {
  const typeNames = [];
  if (!type?.types?.length) {
    return '';
  }
  type.types.forEach((x) => {
    let item = renderType({ type: x });
    if (item) {
      typeNames.push(span('ttd-sig-union-item', item));
    }
  });
  return span('ttd-sig-union-block', typeNames.join(' | '));
}

/** 参数类型 */
function renderType(param, options) {
  options = options || {};
  let type = '';
  const paramType = param.type?.type;

  if (paramType === 'intrinsic') {
    type = span('ttd-sig-param-type', param.type.name);
  }

  if (paramType === 'array') {
    const elementType = renderType({ type: param.type.elementType });
    type = span('ttd-sig-param-type', `Array${brackets(elementType)}`);
  }

  if (paramType === 'reflection') {
    const typeKind = param.type.declaration?.kind;
    if (typeKind === KIND.TypeLiteral && !options.expandTypeLiteral) {
      type = span('ttd-sig-param-type', 'Object');
    } else {
      type = renderDeclarationType(param.type.declaration);
    }
  }

  if (paramType === 'reference') {
    type = renderReferenceType(param.type);
  }

  if (paramType === 'literal') {
    type = span('ttd-sig-param-type', (param.defaultValue || param.type.value) + '');
  }

  if (paramType === 'union') {
    type = renderUnion(param.type);
  }
  return type;
}

function renderSignatureParams(node) {
  const params = node.nodeParameters.map((x) => {
    const name = span('ttd-sig-param-name', x.name);
    const optional = x.isOptional ? span('ttd-sig-param-optional', '?') : '';
    const type = renderType(x);
    return span('ttd-sig-param', `${name}${optional}: ${type}`);
  });
  return params.filter((x) => x !== '').join(', ');
}

/** 函数的泛型声明 */
function renderFnTypeParams(node) {
  const typeParams = node?.signatures?.[0]?.typeParameter;
  if (typeParams?.length) {
    return brackets(`${typeParams.map((x) => x.name).join(', ')}`);
  }
  return '';
}

/** 获取函数的类型签名 */
function renderFnTypeSignature(node) {
  const keyword = span('ttd-sig-kind', 'function');
  const fnName = span('ttd-sig-name', node.name);
  const fnTypeParams = renderFnTypeParams(node);
  const params = renderSignatureParams(node);
  const returnType = span('ttd-sig-returntype', renderType({ type: node.nodeReturnType }) || 'void');
  return span('ttd-sig ttd-sig-fn', `${keyword} ${fnName}${fnTypeParams}(${params}): ${returnType}`);
}

module.exports = {
  renderFnTypeSignature,
  renderType,
};
