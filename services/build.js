const axios = require('axios');
const { generateBuildConfigs } = require('./utils');
const build = async (values) => {
  const { configs } = generateBuildConfigs(values);

  if (!configs?.length) {
    return;
  }

  for (const config of configs) {
    const response = await axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });

    return response?.id;
  }
};

module.exports = { build };
