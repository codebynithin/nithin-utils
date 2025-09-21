// const { checkConfig } = require('./init-config');
const { build, buildStatus } = require('./build');
const { deploy } = require('./deploy');
const { ACTIONS } = require('./enums/actions.enum');
const { convertParamsToMap, wait } = require('./utils');
const { createBranch } = require('./create-branch');
const { mrAIReview } = require('./review');
const { refactor } = require('./refactor');

const processArgs = async (type, value) => {
  try {
    let values;

    if (
      type !== ACTIONS.HELP &&
      type !== ACTIONS.VERSION &&
      !value.includes('--h') &&
      !value.includes('-help')
    ) {
      values = await convertParamsToMap(value, type);
    }

    if (type === ACTIONS.REFACTOR) {
      values = value;
    }

    if (values === null) {
      return;
    }

    switch (type) {
      case ACTIONS.BUILD: {
        if (value === '-help' || value === '--h') {
          console.log(`usage: \tnu build [-project <project name>] [-components <component name>] [-instance <instance name>]
\tnu build [-p <project name>] [-c <component name>] [-i <instance name>]

Build specified components

Options:
  -p, --project <name>  project name | portal, gateway, phr, configService, healthRecords, centralAuth, mpi, phrAdminBackend, phrAdminClient, terminologyService
  -c, --components <name> component name | client, administration, provider, rest-api
  -i, --instance <name> instance name | dev, qa, pilot`);

          return;
        }

        await build(values);

        break;
      }

      case ACTIONS.BUILD_DEPLOY: {
        if (value === '-help' || value === '--h') {
          console.log(`usage: \tnu build-deploy [-project <project name>] [-components <component name>] [-instance <instance name>]
\tnu build-deploy [-p <project name>] [-c <component name>] [-i <instance name>]

Build and deploy specified components

Options:
  -p, --project <name>  project name | portal, gateway, phr, configService, healthRecords, centralAuth, mpi, phrAdminBackend, phrAdminClient, terminologyService
  -c, --components <name> component name | client, administration, provider, rest-api
  -i, --instance <name> instance name | dev, qa, pilot`);

          return;
        }

        const configs = await build(values);

        console.log('Build in progress...');

        await wait(240000);
        await buildStatus(values, configs);

        if (Object.values(configs).every(({ status }) => status === 'passed')) {
          console.log('Deploy in progress...');

          await deploy(values);
        } else {
          console.log('Build failed. Deploy skipped.');
        }

        break;
      }

      case ACTIONS.DEPLOY: {
        if (value === '-help' || value === '--h') {
          console.log(`usage: \tnu deploy [-project <project name>] [-components <component name>] [-instance <instance name>]
\tnu deploy [-p <project name>] [-c <component name>] [-i <instance name>]

Deploy specified components

Options:
  -p, --project <name>  project name | portal, gateway, phr, configService, healthRecords, centralAuth, mpi, phrAdminBackend, phrAdminClient, terminologyService
  -c, --components <name> component name | client, administration, provider, rest-api
  -i, --instance <name> instance name | dev, qa, pilot`);

          return;
        }

        await deploy(values);

        break;
      }

      case ACTIONS.CREATE_BRANCH: {
        if (value === '-help' || value === '--h') {
          console.log(`usage: \tnu create-branch [-task <task number>] [-type <feat|fix>] [-description <description>] [-project <project short name>]
\tnu create-branch [-t <task number>] [-ty <feat|fix>] [-d <description>] [-p <project short name>]

Create git branch

Options:
  -t, --task <number>  task number
  -ty, --type <type>  type | feat, fix
  -d, --description <description>  description
  -p, --project <project short name>  project short name | portal, gateway, phr, configService, healthRecords, centralAuth, mpi, phrAdminBackend, phrAdminClient, terminologyService`);

          return;
        }

        await createBranch(values);

        break;
      }

      case ACTIONS.REVIEW: {
        if (value === '-help' || value === '--h') {
          console.log(`usage: \tnu review [-project <project short name>] [-mergeId <merge id>]
\tnu review [-p <project short name>] [-mId <merge id>]

Review merge request

Options:
  -p, --project <project short name>  project short name | portal, gateway, phr, configService, healthRecords, centralAuth, mpi, phrAdminBackend, phrAdminClient, terminologyService
  -mId, --mergeId <merge id>  merge id
  -r, --repository <repository name>  repository name
  
Repository list:
  portalClient
  portalBackend
  portalDeployment
  portalAutomation
  gatewayBackend
  gatewayClient
  gatewayDeployment
  phrClient
  phrBackend
  phrDeployment
  configService
  healthRecords
  centralAuth
  mpi
  phrAdminBackend
  phrAdminClient
  terminologyService`);

          return;
        }

        await mrAIReview(values);

        break;
      }

      case ACTIONS.REFACTOR: {
        if (value === '-help' || value === '--h') {
          console.log(`Usage: \tnu refactor <text>

Enhance the provided text for improved clarity, conciseness, and professional quality.`);

          return;
        }

        await refactor(values);

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
        \t[${ACTIONS.BUILD}] [${ACTIONS.DEPLOY}] [${ACTIONS.BUILD_DEPLOY}]
        \t[${ACTIONS.CREATE_BRANCH}] [${ACTIONS.REVIEW}]\n
Available commands:\n
  build         : Build specified components
  deploy        : Deploy specified components
  build-deploy  : Build and then deploy
  create-branch : Create git branch
  review        : AI Review specified merge request
  refactor      : REFACTOR the provided text for improved clarity, conciseness, and professional quality.
  version       : Show version info
  help          : Show help

For details of each actions run 'nu <action> -help'

Example usage:\n
  nu build -project <project> -components <components> -instance <instance>
  nu deploy -project <project> -components <components> -instance <instance>
  nu build-deploy -project <project> -components <components> -instance <instance>
  nu create-branch -task <task number> -type <feat|fix> -description <description> -project <project short name>
  nu review -project <project short name> -mergeId <merge id> -repository <repository name>

Running 'nu help' will list available subcommands and provide some conceptual guides.`);
        break;
      }

      default: {
        console.error(`nu: '${type}' is not a nu command. See 'nu help'.`);

        return;
      }
    }
  } catch (error) {
    console.log(error);
  }

  process.exit(1);
};

module.exports = { processArgs };
