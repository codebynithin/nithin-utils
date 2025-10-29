const axios = require('axios');
const os = require('os');
const path = require('path');
const fs = require('fs');
const getZohoTasks = async ({ params = {} }) => {
  const headers = await getZohoHeaders();
  let activeSprint;

  if (!params?.sprint) {
    if (params?.type) {
      if (typeof params.type === 'string') {
        params.type = params.type.split(',');
      }
    } else {
      params.type = ['2'];
    }

    activeSprint = await getSprints({ params });

    params.sprint = activeSprint?.[0]?.value;
  } else {
    const isValidSprint = await checkSprintId(params.sprint, { headers, params });

    if (!isValidSprint) {
      console.error('Invalid sprint ID');
    }
  }

  if (activeSprint?.length > 1) {
    const resp = [];

    for (const sprint of activeSprint) {
      params.sprint = sprint.value;

      const tasks = await getTasksBySprint({ params, headers });

      resp.push(...(tasks || []));
    }

    return resp;
  } else {
    return getTasksBySprint({ params, headers });
  }
};
const getTasksBySprint = async ({ params, headers }) => {
  const { zoho } = await zohoConfig();
  const p = {
    action: 'data',
    index: params.index || 1,
    range: params.range || 300,
    sprint: params.sprint || null,
    project: params.project || '139011000000148327',
    subitem: params.subitem || false,
    team: '803166918',
  };
  const parentUrl = `https://${zoho.url}/zsapi/team/${p.team}/projects/${p.project}/sprints/${p.sprint}/item/?action=${p.action}&range=${p.range}&index=${p.index}&subitem=${p.subitem}&customviewid=${zoho.customviewid}`;

  try {
    const response = await axios.get(parentUrl, { headers });

    return Object.entries(response.data.itemJObj).reduce(async (acc, [key, values]) => {
      if (params.filterUser) {
        for (const value of values) {
          if (typeof value === 'object' && value.length) {
            const { data, error } = await zohoTaskDetails({ params: { item: key } });

            if (error) {
              throw new Error(
                `Failed to check if test exists in ncd with status code ${error.statusCode}`,
              );
            }
            console.log(data);

            acc.push({ value: key, label: values[0], taskId: values[1] });
          }
        }
      } else {
        const { data, error } = await zohoTaskDetails({ params: { item: key } });

        if (error) {
          throw new Error(
            `Failed to check if test exists in ncd with status code ${error.statusCode}`,
          );
        }

        console.log(data);
        acc.push({ value: key, label: values[0], taskId: values[1] });
      }

      return acc.sort((a, b) => a.taskId - b.taskId);
    }, []);
  } catch (error) {
    console.error(error.message);
  }
};
const checkSprintId = async (id, req) => {
  const sprints = await getSprints(req);

  return sprints.some(({ value }) => value === id);
};
const userHomeDir = `${os.homedir()}/.time-entry`;
const filePath = path.join(userHomeDir, '.zoho-config');
const readFileSync = (path) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (error) {
    console.log('Error reading file:', error);
  }
};
const getSprints = async ({ params }) => {
  const config = await zohoConfig();
  const headers = await getZohoHeaders(config);
  const p = {
    index: params.index || 1,
    range: params.range || 150,
    project: params.project || config.project.default.value,
    action: 'data',
    team: '803166918',
  };

  if (params?.type) {
    if (typeof params.type === 'string') {
      p.type = params.type.split(',');
    } else {
      p.type = params.type;
    }
  } else {
    p.type = ['2', '3'];
  }
  const parentUrl = `https://${config.zoho.url}/zsapi/team/${p.team}/projects/${
    p.project
  }/sprints/?action=${p.action}&range=${p.range}&type=${encodeURIComponent(
    JSON.stringify(p.type),
  )}&index=${p.index}`;

  try {
    const response = await axios.get(parentUrl, { headers });

    return Object.entries(response.data.sprintJObj)
      .map(([key, value]) => ({ value: key, label: value[0] }))
      .sort((a, b) => (a.label < b.label ? 1 : a.label > b.label ? -1 : 0));
  } catch (error) {
    console.error(error.message);
  }
};
const zohoConfig = async (jsonData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!jsonData) {
        const data = readFileSync(filePath);
        jsonData = JSON.parse(data);
      }

      if (!Object.values(jsonData).length) {
        throw new Error('No configurations found, try `zoho init` as first step.');
      }

      resolve(jsonData);
    } catch (parseError) {
      reject(parseError);
    }
  });
};
const getZohoHeaders = async (config) => {
  if (!config) {
    config = await zohoConfig();
  }

  return {
    authority: config.zoho.url,
    accept: '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,ml;q=0.7',
    'cache-control': 'no-cache',
    cookie: config.zoho.cookie,
    pragma: 'no-cache',
    referer: `https://${config.zoho.url}/workspace/4medica/client/wmoku`,
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    'x-za-clientportalid': config.zoho.portalId,
    'x-za-reqsize': 'large',
    'x-za-sessionid': config.zoho.sessionId,
    'x-za-source': config.zoho.source,
    'x-za-ui-version': 'v2',
    'x-zcsrf-token': config.zoho.token,
  };
};
const zohoTaskDetails = async ({ params }) => {
  const config = await zohoConfig();
  const headers = await getZohoHeaders(config);
  const p = {
    item: params.item,
    project: params.project || config.project.default.value,
    action: 'details',
    team: '803166918',
  };

  /* if (params?.type) {
    if (typeof params.type === 'string') {
      p.type = params.type.split(',');
    } else {
      p.type = params.type;
    }
  } else {
    p.type = ['2', '3'];
  } */

  return axios
    .request({
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://${config.zoho.url}/zsapi/team/${p.team}/projects/${p.project}/item/${p.item}/?action=${p.action}`,
      headers,
    })
    .then((response) => {
      return { data: response.data, error: null };
    })
    .catch((error) => {
      return {
        data: null,
        error: { statusCode: error.response?.status, message: error.message },
      };
    });
};

module.exports = { getZohoTasks };
