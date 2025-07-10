const { init } = require('create-npm-file-map');
const fileMap = require('./file-map');

const builder = init({
  outDir: 'lib',
  input: fileMap,
});

builder.build();
