const axios = require('axios');
const { generateBuildConfigs, generateBuildStatusConfigs } = require('./utils');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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

  for (const [key, { config }] of Object.entries(configs)) {
    let status = await checkStatus(config);

    while (status !== 'passed' && status !== 'failed') {
      await wait(30000);

      status = await checkStatus(config);
    }

    configs[key].status = status;
  }

  return configs;
};
const checkStatus = async (config) => {
  await axios
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
