const axios = require('axios');
const { generateBuildConfigs } = require('./utils');
const build = async (values) => {
  const { configs } = generateBuildConfigs(values);
  const buildIds = [];

  if (!configs?.length) {
    return;
  }

  for (const config of configs) {
    await axios
      .request(config)
      .then((response) => {
        buildIds.push(response?.data?.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  console.log('Built: ', { buildIds });

  return buildIds;
};
const buildStatus = async (values) => {
  const { configs } = generateBuildConfigs(values);
  const buildIds = [];

  if (!configs?.length) {
    return;
  }

  for (const config of configs) {
    await axios
      .request(config)
      .then((response) => {
        buildIds.push(response?.data?.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  console.log('Built: ', { buildIds });

  return buildIds;
};

module.exports = { build, buildStatus };
