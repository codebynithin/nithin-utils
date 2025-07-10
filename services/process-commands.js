// const { checkConfig } = require('./init-config');
const { build } = require('./build');
const { ACTIONS } = require('./enums/actions.enum');
const { convertParamsTpMap } = require('./utils');
const processArgs = async (type, value) => {
  try {
    // await checkConfig();

    const values = convertParamsTpMap(value);

    switch (type) {
      /* case ACTIONS.DEPLOY: {
        await deploy(values);

        break;
      } */

      case ACTIONS.BUILD: {
        await build(values);

        break;
      }

      /* case ACTIONS.SIMPLE_DEPLOY: {
        await simpleDeploy(values);

        break;
      } */

      case ACTIONS.VERSION: {
        const path = require('path');
        const packageJson = require(path.resolve(__dirname, '../package.json'));
        const packageVersion = packageJson.version;

        console.log('Package version:', packageVersion);

        break;
      }

      case ACTIONS.HELP: {
        console.log(`usage: nu \t[${ACTIONS.VERSION}] [${ACTIONS.HELP}] [${ACTIONS.INIT}] [${ACTIONS.SWITCH}]
        \t[${ACTIONS.ADD}] [${ACTIONS.UPDATE}] [${ACTIONS.DELETE}] [${ACTIONS.STATUS}] [${ACTIONS.ENTRIES}] [${ACTIONS.ZOHO}]\n`);
        console.log(`Below are common Time Entry commands utilized in various scenarios:\n
Start a time entry:\n
  ${ACTIONS.INIT} \t\t: Initialize and input necessary information.
  ${ACTIONS.SWITCH} \t: Switch between the default projects.\n

Work on the Current Change:\n
  ${ACTIONS.ADD} \t\t: Add your time details.
  ${ACTIONS.UPDATE} \t: Update existing time details.
  ${ACTIONS.DELETE} \t: Remove existing time details.\n

Examine the History:\n
  ${ACTIONS.ENTRIES} \t: View each time entry's details by date.
  ${ACTIONS.STATUS} \t: View daily status of time entries.
  ${ACTIONS.ZOHO} \t\t: Update time entries remotely.

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
