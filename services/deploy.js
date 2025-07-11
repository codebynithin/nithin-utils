const axios = require('axios');
const { generateDeployConfigs } = require('./utils');
const deploy = async (values) => {
  const { configs } = generateDeployConfigs(values);
  const buildIds = [];

  await axios
    .request(configs)
    .then((response) => {
      buildIds.push(response?.data?.id);
    })
    .catch((error) => {
      console.log(error);
    });

  console.log('Deployed: ', { buildIds });

  return buildIds;
};

module.exports = { deploy };
