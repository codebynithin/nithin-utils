const path = require('path');
require('dotenv').config({ path: path.resolve(require('os').homedir(), 'Desktop/.env.nu') });

const csrfToken = process.env.CSRF_TOKEN;
const cookie = process.env.COOKIE;
const keyMap = {
  components: 'components',
  c: 'components',
  project: 'project',
  p: 'project',
  instance: 'instance',
  i: 'instance',
  branch: 'branch',
  b: 'branch',
};
const componentMap = {
  client: '-client',
  backend: '-backend',
  deployment: '-deployment',
};
const projectMap = {
  portal: 'medica-portal',
  gateway: 'gateway-app',
  phr: 'phr',
};
const generateBuildConfigs = (values = {}) => {
  const configs = [];
  const branchMap = {
    dev: 'dev-qa-testing',
    qa: 'qa-testing',
    pilot: 'pilot-release',
  };
  const instanceMap = {
    qa: 'qa',
    pilot: 'demo',
  };

  if (!values.components) {
    console.log('Invalid build parameters');
    return;
  }

  // Helper for headers
  const buildHeaders = (url) => ({
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: `${url}/new`,
    'X-CSRF-Token': csrfToken,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    Origin: 'https://gitlab.4medica.net',
    Connection: 'keep-alive',
    Cookie: cookie,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    TE: 'trailers',
  });

  // Prepare build data
  const baseRef = values.branch
    ? `refs/heads/${branchMap[values.branch] || values.branch}`
    : `refs/heads/${branchMap.dev}`;
  const dataBase = {
    ref: baseRef,
    variables_attributes: [],
  };

  // Handle instance/tag
  if (values.instance) {
    dataBase.variables_attributes.push({
      variable_type: 'env_var',
      key: 'TAG',
      secret_value: instanceMap[values.instance],
    });
  }

  // Helper for config creation (clone dataBase to avoid mutation)
  const makeConfig = (url, data) => ({
    method: 'post',
    maxBodyLength: Infinity,
    url,
    data: JSON.stringify(data),
    headers: buildHeaders(url),
  });

  const project = values.project || projectMap.portal;
  const comps = values.components;

  // Client config
  if (comps.includes('client')) {
    configs.push(
      makeConfig(`https://gitlab.4medica.net/cxd/${project}${componentMap.client}/-/pipelines`, {
        ...dataBase,
      }),
    );
  }

  // Backend config (admin, provider, rest-api)
  const backendComps = ['administration', 'provider', 'rest-api'];
  if (backendComps.some((c) => comps.includes(c))) {
    const apps = [];
    if (comps.includes('administration')) apps.push('administration');
    if (comps.includes('provider')) apps.push('provider');

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
    configs.push(
      makeConfig(
        `https://gitlab.4medica.net/cxd/${project}${componentMap.backend}/-/pipelines`,
        backendData,
      ),
    );
  }

  return { configs };
};
const convertParamsTpMap = (item) => {
  return item?.split('-')?.reduce((acc, item) => {
    if (!item) {
      return acc;
    }

    let [key, ...itemValues] = item.split(' ');
    let itemValue = itemValues.join(' ');

    if (key.charAt(0) === '-') {
      key = key.substring(1);
    }

    acc[keyMap[key]] = itemValue;

    return acc;
  }, {});
};

module.exports = {
  convertParamsTpMap,
  generateBuildConfigs,
};
