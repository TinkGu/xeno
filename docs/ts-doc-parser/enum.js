const path = require('path');
const { ReflectionKind } = require('typedoc');

const KIND = ReflectionKind;
const rootPath = path.resolve(__dirname, '../../');
const repoUrl = 'https://github.com/TinkGu/xeno';

module.exports = {
  KIND,
  rootPath,
  repoUrl,
};
