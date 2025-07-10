function hx(level, children) {
  const l = parseInt(level, 10);
  if (!l || l < 0) {
    return children || '';
  }

  if (l >= 7) {
    return `###### ${children || ''}`;
  }

  return `${'######'.slice(0, l)} ${children || ''}`;
}

function span(className, children) {
  let cls = '';
  let str = '';
  if (typeof children === 'string' || typeof children === 'number') {
    str = children;
  }

  if (Array.isArray(children)) {
    str = children.join('');
  }

  if (typeof className === 'string') {
    cls = className;
  }

  if (Array.isArray(className)) {
    cls = className.flatMap((x) => x).join(' ');
  }
  return `<span class="${cls || ''}">${str || ''}</span>`;
}

function div(className, children) {
  return span(['ttd-div', className], children);
}

function popup(className, children) {
  return span(['ttd-popup', className], children);
}

function link(className, children, options) {
  return `<a className="ttd-link ${className || ''}" href=${options?.href || ''}>${children || ''}</a>`;
}

function brackets(children, type) {
  let _t = 'angle'; // 尖括号
  if (type) {
    _t = type;
  }
  return span(['ttd-brackets', `ttd-brackets-${_t}`], children);
}

module.exports = {
  hx,
  span,
  popup,
  div,
  link,
  brackets,
};
