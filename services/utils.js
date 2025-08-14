const path = require('path');
const axios = require('axios');
const { ACTIONS } = require('./enums/actions.enum');

require('dotenv').config({ path: path.resolve(require('os').homedir(), 'Desktop/.env.nu') });

const csrfToken = process.env.CSRF_TOKEN;
const Cookie = process.env.COOKIE;
const Origin = process.env.ORIGIN;
const gitlabToken = process.env.GITLAB_TOKEN;
const keyMap = {
  components: 'components',
  c: 'components',
  project: 'project',
  p: 'project',
  instance: 'instance',
  i: 'instance',
  branch: 'branch',
  b: 'branch',
  task: 'task',
  t: 'task',
  type: 'type',
  y: 'type',
  description: 'description',
  d: 'description',
  mergeId: 'mergeId',
  mId: 'mergeId',
};
const projectMap = {
  portal: 'medica-portal',
  gateway: 'gateway-app',
  phr: 'phr',
};
const buildBranchMap = {
  dev: 'dev-qa-testing',
  qa: 'qa-testing',
  pilot: 'pilot-release',
};
const deploymentBranchMap = {
  dev: 'dev-qa-testing',
  qa: 'qa-testing',
  pilot: 'development',
};
const imageTagMap = {
  qa: 'qa',
  pilot: 'demo',
};
const projectIdMap = {
  portalClient: '162',
  portalBackend: '163',
  portalDeployment: '164',
  portalAutomation: '229',
  gatewayBackend: '305',
  gatewayClient: '306',
  gatewayDeployment: '304',
  phrClient: '100',
  phrBackend: '117',
  phrDeployment: '64',
  configService: '227',
  healthRecords: '115',
  centralAuth: '134',
  mpi: '10',
  phrAdminBackend: '126',
  phrAdminClient: '130',
  terminologyService: '203',
};
const backendComps = ['administration', 'provider', 'rest-api'];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const buildHeaders = (url) => ({
  'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: `${url}/new`,
  'X-CSRF-Token': csrfToken,
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/json',
  Origin,
  Connection: 'keep-alive',
  Cookie,
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  TE: 'trailers',
});
const makeConfig = (url, data, method = 'post') => ({
  method,
  maxBodyLength: Infinity,
  url,
  data: JSON.stringify(data),
  headers: buildHeaders(url),
});
const removeEmpty = (obj) => {
  Object.entries(obj).forEach(([key, val]) => {
    if (val && typeof val === 'object') {
      removeEmpty(val);

      if (!(Object.keys(val).length || val instanceof Date)) {
        delete obj[key];
      }
    } else {
      if (typeof val === 'string') {
        val = val.trim();
      }

      if (val === null || val === undefined || val === '') {
        delete obj[key];
      } else {
        obj[key] = val;
      }
    }
  });

  return obj;
};
const generateBuildConfigs = (values = {}) => {
  const configs = {
    client: {
      config: null,
      buildId: null,
    },
    backend: {
      config: null,
      buildId: null,
    },
  };

  if (!values.components) {
    console.log('Invalid build parameters');

    return { configs: removeEmpty(configs, true) };
  }

  const variables_attributes = [];

  if (values.instance) {
    variables_attributes.push({
      variable_type: 'env_var',
      key: 'TAG',
      secret_value: values.instance,
    });

    if (!values.branch) {
      values.branch = buildBranchMap[values.instance];
    }
  }

  const baseRef = values.branch
    ? `refs/heads/${buildBranchMap[values.branch] || values.branch}`
    : `refs/heads/${buildBranchMap.dev}`;
  const dataBase = {
    ref: baseRef,
    variables_attributes,
  };
  const project = projectMap[values.project] || projectMap.portal;

  // Client config
  if (values.components.includes('client')) {
    configs.client.config = makeConfig(`${Origin}/cxd/${project}-client/-/pipelines`, {
      ...dataBase,
    });
  }

  // Backend config (admin, provider, rest-api)
  if (backendComps.some((c) => values.components.includes(c))) {
    const apps = [];
    if (values.components.includes('administration')) apps.push('administration');
    if (values.components.includes('provider')) apps.push('provider');

    const backendData = {
      ...dataBase,
      variables_attributes: [
        ...dataBase.variables_attributes,
        ...(apps.length
          ? [
              {
                variable_type: 'env_var',
                key: 'APPS',
                secret_value: apps.join(' '),
              },
            ]
          : []),
      ],
    };
    configs.backend.config = makeConfig(
      `${Origin}/cxd/${project}-backend/-/pipelines`,
      backendData,
    );
  }

  return { configs: removeEmpty(configs, true) };
};
const generateBuildStatusConfigs = (values = {}, configs) => {
  const project = projectMap[values.project] || projectMap.portal;

  if (values.components.includes('client') && configs.client.buildId) {
    configs.client.statusConfig = makeConfig(
      `${Origin}/cxd/${project}-client/-/pipelines/${configs.client.buildId}`,
      null,
      'get',
    );
  }

  if (backendComps.some((c) => values.components.includes(c)) && configs.backend.buildId) {
    configs.backend.statusConfig = makeConfig(
      `${Origin}/cxd/${project}-backend/-/pipelines/${configs.backend.buildId}`,
      null,
      'get',
    );
  }

  return removeEmpty(configs, true);
};
const generateDeployConfigs = (values = {}) => {
  const variables_attributes = [];

  if (!values.instance) {
    values.instance = 'dev';
  }

  values.branch = buildBranchMap[values.instance] || buildBranchMap.dev;

  if (values.instance === 'qa') {
    variables_attributes.push({
      variable_type: 'env_var',
      key: 'IMAGE_TAG',
      secret_value: values.instance,
    });
  }

  if (values.instance !== 'dev') {
    variables_attributes.push({
      variable_type: 'env_var',
      key: 'INSTANCE',
      secret_value: imageTagMap[values.instance] || values.instance,
    });
  }

  if (values.instance === 'pilot') {
    variables_attributes.push({
      variable_type: 'env_var',
      key: 'COMPONENT',
      secret_value: 'client-pilot',
    });
  } else {
    variables_attributes.push({
      variable_type: 'env_var',
      key: 'COMPONENT',
      secret_value: values.components || 'client',
    });
  }

  const project = projectMap[values.project] || projectMap.portal;
  const configs = makeConfig(`${Origin}/cxd/${project}-deployment/-/pipelines`, {
    ref: `refs/heads/${deploymentBranchMap[values.instance]}`,
    variables_attributes,
  });

  return { configs: removeEmpty(configs, true) };
};
const convertParamsToMap = async (item, type) => {
  const itemsToSkipCheck = [ACTIONS.CREATE_BRANCH];
  const skipCheck = itemsToSkipCheck.includes(type);
  let live = false;

  if (!skipCheck) {
    if (!(csrfToken || Cookie || Origin || gitlabToken)) {
      console.log('Configurations are missing...!');
      return null;
    }

    console.log(`Checking website status...`);

    await axios
      .get(Origin)
      .then(() => {
        live = true;

        console.log(`Website is live.`);
      })
      .catch((err) => {
        console.log(`Website is not reachable:`, err.message);
      });

    if (!live) {
      return null;
    }
  }

  return item?.split('-')?.reduce((acc, item) => {
    if (!item) {
      return acc;
    }

    let [key, ...itemValues] = item.split(' ');
    let itemValue = itemValues.join(' ').trim();

    if (key.charAt(0) === '-') {
      key = key.substring(1);
    }

    acc[keyMap[key]] = itemValue;

    return acc;
  }, {});
};

module.exports = {
  convertParamsToMap,
  generateBuildConfigs,
  generateDeployConfigs,
  generateBuildStatusConfigs,
  wait,
  gitlabToken,
  projectIdMap,
};
