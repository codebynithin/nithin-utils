// const { checkConfig } = require('./init-config');
const { build, buildStatus } = require('./build');
const { deploy } = require('./deploy');
const { ACTIONS } = require('./enums/actions.enum');
const { convertParamsToMap, wait } = require('./utils');
const processArgs = async (type, value) => {
  try {
    let values;

    if (type !== ACTIONS.HELP && type !== ACTIONS.VERSION) {
      values = await convertParamsToMap(value);
    }

    if (values === null) {
      return;
    }

    switch (type) {
      case ACTIONS.BUILD: {
        await build(values);

        break;
      }

      case ACTIONS.BUILD_DEPLOY: {
        const configs = await build(values);

        console.log('Build in progress...');

        await wait(240000);
        await buildStatus(values, configs);

        console.log('Deploy in progress...');

        await deploy(values);

        break;
      }

      case ACTIONS.DEPLOY: {
        await deploy(values);

        break;
      }

      case ACTIONS.VERSION: {
        const path = require('path');
        const packageJson = require(path.resolve(__dirname, '../package.json'));
        const packageVersion = packageJson.version;

        console.log('Package version:', packageVersion);

        break;
      }

      case ACTIONS.HELP: {
        console.log(`usage: nu \t[${ACTIONS.VERSION}] [${ACTIONS.HELP}]
        \t[${ACTIONS.BUILD}] [${ACTIONS.BUILD_DEPLOY}] [${ACTIONS.DEPLOY}]\n
Available commands:\n
  build         : Build specified components
  deploy        : Deploy specified components
  build-deploy  : Build and then deploy
  version       : Show version info
  help          : Show help

Example usage:\n
  nu build -project <project> -components <components> -instance <instance>
  nu deploy -project <project> -components <components> -instance <instance>
  nu build-deploy -project <project> -components <components> -instance <instance>

Running 'nu help' will list available subcommands and provide some conceptual guides.`);
        break;
      }

      default: {
        console.error(`nu: '${type}' is not a nu command. See 'nu -help'.`);

        return;
      }
    }
  } catch (error) {
    console.log(error);
  }

  process.exit(1);
};

module.exports = { processArgs };
