const path = require('path');
const spawn = require('cross-spawn');
const { generateFiles, draftModules } = require('./generator');
const { convert } = require('./converter');
const { rootPath } = require('./enum');
const { generateTypedocTsconfig } = require('./tsconfig-template');
const { bootTypedoc } = require('./typedoc');
const { generateOverview } = require('./overview');

function getArgs() {
  try {
    const cliArgs = process.argv.slice(2);
    return {
      clean: cliArgs.includes('-c'),
      dev: cliArgs.includes('-d'),
    };
  } catch (err) {
    return {};
  }
}

async function build() {
  const args = getArgs();
  const outPath = path.join(rootPath, './docs/docs/api');
  const tsConfig = path.join(rootPath, 'tsconfig.docs.json');
  generateTypedocTsconfig({ outPath, tsConfig });
  if (args.clean) {
    spawn.sync('rm', ['-rf', outPath]);
  }
  const typedoc = bootTypedoc({ outPath, tsConfig, dev: args.dev, rootPath });
  const project = convert(typedoc.projectData, { outPath });
  const files = [...draftModules(project)];
  generateFiles(files);
  generateOverview({ outPath });
}

build();
