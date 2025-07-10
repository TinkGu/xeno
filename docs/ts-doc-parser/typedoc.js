const td = require('typedoc');
const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs-extra');

const ExitCodes = {
  Ok: 0,
  OptionError: 1,
  NoEntryPoints: 2,
  CompileError: 3,
  ValidationError: 4,
  OutputError: 5,
  ExceptionThrown: 6,
};

function bootTypedoc({ tsConfig, outPath, rootPath, dev }) {
  const app = new td.Application();
  app.options.setValue('tsconfig', tsConfig);
  app.options.addReader(new td.TypeDocReader());
  app.options.addReader(new td.TSConfigReader());
  app.bootstrap({
    tsconfig: tsConfig,
  });

  try {
    const project = getTdProject(app);
    const out = path.resolve(outPath);
    const eventData = {
      outputDirectory: path.dirname(out),
      outputFile: path.basename(out),
    };
    const data = app.serializer.projectToObject(project, {
      begin: eventData,
      end: eventData,
    });
    if (dev) {
      generateJson(data, { rootPath });
    }
    return {
      typeDocApp: app,
      typeDocProject: project,
      projectData: data,
    };
  } catch (err) {
    console.error('\n');
    console.error('TypeDoc exiting with unexpected error:');
    console.error('\n');
    console.error(new Error(err));
    process.exit();
  }
}

/** 生成对应的 json，方便排查问题 */
function generateJson(data, { rootPath }) {
  fs.outputJson(path.join(rootPath, '.log/typedoc.json'), data, { spaces: 2 });
}

function getTdProject(app) {
  if (app.logger.hasErrors()) {
    throw ExitCodes.ValidationError;
  }
  if (app.options.getValue('treatWarningsAsErrors') && app.logger.hasWarnings()) {
    throw ExitCodes.OptionError;
  }
  const project = app.convert();

  if (!project) {
    throw ExitCodes.CompileError;
  }

  app.validate(project);
  if (app.logger.hasErrors()) {
    throw ExitCodes.OptionError;
  }

  return project;
}

function callTypedocByShell({ tsConfig }) {
  spawn.sync('node_modules/.bin/typedoc', ['--tsconfig', tsConfig], { stdio: 'inherit' });
}

module.exports = {
  bootTypedoc,
  callTypedocByShell,
};
