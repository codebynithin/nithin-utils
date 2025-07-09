const axios = require('axios');
const { getBuildVariables } = require('./utils');
const build = async (values) => {
  const { ref, url, variables_attributes, csrfToken, cookie } = getBuildVariables(values);

  let data = JSON.stringify({
    ref,
    variables_attributes,
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
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
    },
    data: data,
  };

  const response = await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

  return response.id;
};

module.exports = { build };
