const path = require('path');
const fs = require('fs');
const { rootPath } = require('./enum');
const { findByFileMap, findByIndexExports } = require('../../scripts/find-entry');

const indexFiles = findByIndexExports({}).map((x) => path.join(rootPath, x));
const entryPoints = indexFiles.concat(findByFileMap());

const template = {
  extends: './tsconfig.build.json',
  compilerOptions: {
    typeRoots: ['types', 'node_modules/@types/node'],
  },
  include: ['src/**/*.ts', 'types'],
  exclude: ['node_modules', 'node-scripts', '**/*.spec.ts', '**/*.stories.ts', '**/*.test.ts', '**/*_test.ts'],
  typedocOptions: {
    name: '概览',
    entryPoints,
    // publicPath: '/api/',
    exclude: ['**/*@(.spec|.stories|.test|._test).ts', '**/node_modules/**'],
    excludeExternals: true,
    excludeTags: ['todo'],
    readme: 'none',
    markedOptions: {
      breaks: true,
    },
    githubPages: false,
    sort: ['source-order'],
  },
};

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

function generateTypedocTsconfig({ tsConfig, outPath }) {
  writeJson(tsConfig, {
    ...template,
    typedocOptions: {
      ...template.typedocOptions,
      entryPoints: indexFiles.concat(findByFileMap()),
      out: outPath,
    },
  });
}

module.exports = {
  template,
  generateTypedocTsconfig,
};
