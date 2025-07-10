/** 转换 typedoc 的数据 */
const { KIND, rootPath, repoUrl } = require('./enum');

/** 转换 typedoc 数据 */
function convert(typedocData, options) {
  const nodes = getAllNodes(typedocData);
  const transducers = registerTransducers();
  const nodeMap = normalizeNodesById(nodes, transducers);
  const paths = {
    rootPath,
    repoUrl,
    outPath: options.outPath,
  };
  return {
    ...nodeMap,
    nodes,
    paths,
  };
}

/** 获取所有节点 */
function getAllNodes(rawData) {
  let nodes = [];
  let queue = [rawData];

  while (queue.length) {
    const node = queue.shift();
    if (node) {
      nodes.push(node);
    } else {
      break;
    }

    if (node?.children?.length) {
      queue = queue.concat(node.children);
    }
  }
  return nodes;
}

/**
 * 打平 nodes 数组，形成 { id: node } 的 map 结构
 * @param transducers 遍历过程中调用的回调函数，支持最终将结果 reduce 到提供的对象上
 */
function normalizeNodesById(nodes, transducers) {
  const nodeIdMap = {};
  const results = {};
  const keys = Object.keys(transducers);

  nodes.forEach((node, i) => {
    keys.forEach((rkey) => {
      const r = transducers[rkey];
      const [fn, res] = r;
      if (typeof fn === 'function') {
        results[rkey] = fn(res, node, i, nodes);
      }
    });
    nodeIdMap[node.id] = node;
  });

  return {
    nodeIdMap,
    results,
  };
}

// ------ transducers ------

/** 遍历节点，为所有函数加上额外的 meta 信息 */
function transAllParamContainers(_, node) {
  if (node.kind === KIND.Function) {
    convertFunctionMeta(node);
  }
}

/** 遍历节点，获取所有 modules */
function transAllModules(res, node) {
  if (node.kind === KIND.Module) {
    res[node.id] = node;
  }
  return res;
}

/** 为 normalize 过程添加额外的 reducer */
function registerTransducers() {
  return {
    modules: [transAllModules, {}],
    'skip.params': [transAllParamContainers],
  };
}

// ------ getters ------

/** 获取所有 modules */
function getAllModules(project) {
  return project.results.modules;
}

/** 获取 project 中的 id */
function getNode(project, id) {
  return project.nodeIdMap[id];
}

/** 获取模块描述 */
function getModuleTitle(mod) {
  const comment = mod.comment;
  if (comment?.tags?.length) {
    const title = comment?.tags.find((x) => x.tag === 'title');
    return title?.text || '';
  }

  return '';
}

/** 获取模块描述 */
function getModuleDesc(mod) {
  const comment = mod.comment;
  if (comment?.tags?.length) {
    const title = comment?.tags.find((x) => x.tag === 'description');
    return title?.text || '';
  }

  if (comment?.shortText) {
    return comment?.shortText;
  }

  return '';
}

/** 获取模块分组 */
function getModuleGroups(mod) {
  const groups = mod.groups;
  if (!groups?.length) {
    return [];
  }
  // 排序：函数 > 常量
  groups.sort((a, b) => {
    if (a.kind === b.kind) {
      return 0;
    }
    if (a.kind === KIND.Variable) {
      return 1;
    }
    if (a.kind === KIND.Function) {
      return -1;
    }
    return 1;
  });
  return groups;
}

/** 获取函数的 meta 信息 */
function convertFunctionMeta(node) {
  node.nodeParameters = getParams(node);
  node.nodeComment = getComment(node);
  node.nodeReturnType = getReturnType(node);
  return node;
}

function getReturnType(node) {
  return node?.signatures?.[0]?.type;
}

function getCommentObj(node) {
  if (node?.comment) {
    return node.comment;
  }
  return node?.signatures?.[0]?.comment;
}

/** 获取节点的普通注释信息，已经剔除了 tag 等信息 */
function getComment(node) {
  const comment = getCommentObj(node);
  const shortText = comment?.shortText ?? '';
  const longText = comment?.text ?? '';
  return [shortText, longText].filter((x) => x !== '').join('\n') || '';
}

/** 获取节点的 tag 列表 */
function getNodeTagList(node) {
  const comment = getCommentObj(node);
  return comment?.tags || [];
}

/** 获取节点的 tag 列表 */
function getNodeTag(node, tagName) {
  const tags = getNodeTagList(node) || [];
  return tags.find((x) => x.tag === tagName);
}

/**
 * 获取参数
 */
function getParams(node) {
  const params = node?.signatures?.[0]?.parameters || [];
  return params.map((x) => {
    if (x.name === '__namedParameters') {
      x.name = 'options';
    }

    x.isOptional = !!x.flags?.isOptional;

    return x;
  });
}

module.exports = {
  convert,
  getNode,
  convertFunctionMeta,
  getAllModules,
  getModuleTitle,
  getModuleDesc,
  getModuleGroups,
  getComment,
  getNodeTag,
};
