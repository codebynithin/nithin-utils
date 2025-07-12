const axios = require('axios');
const { generateBuildConfigs, generateBuildStatusConfigs, wait } = require('./utils');
const build = async (values) => {
  const { configs } = generateBuildConfigs(values);

  if (!(configs.client.config || configs.backend.config)) {
    return;
  }

  for (const [key, { config }] of Object.entries(configs)) {
    await axios
      .request(config)
      .then((response) => {
        configs[key].buildId = response?.data?.id;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  console.log('Built: ', { buildIds: Object.values(configs).map((c) => c.buildId) });

  return configs;
};
const buildStatus = async (values, configs) => {
  configs = generateBuildStatusConfigs(values, configs);

  for (const [key, { statusConfig }] of Object.entries(configs)) {
    let status = await checkStatus(statusConfig);

    while (status !== 'passed' && status !== 'failed') {
      await wait(30000);

      status = await checkStatus(statusConfig);
    }

    configs[key].status = status;
  }

  return configs;
};
const checkStatus = async (config) => {
  return await axios
    .request(config)
    .then((response) => {
      return response?.data?.details?.status?.label;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

module.exports = { build, buildStatus };
