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
const branchMap = {
  dev: 'dev-qa-testing',
  qa: 'qa-testing',
  pilot: 'pilot-release',
};
const getBuildVariables = (values) => {
  const csrfToken =
    'VakTFXIBbJ-C23BCRAyQCcurwHSOUYbm9cagbjZR-a9k08As94DRTDFqIhzAFPVwK0hofKukW62S9r1caT55uw';
  const cookie =
    'visitor_id=1a0fe835-6fb5-4c3b-b233-4a26b6ce2a68; super_sidebar_collapsed=false; preferred_language=en; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IlcxczNOVjBzSWlReVlTUXhNeVJrUlcxUlJqWnNiSGRRUlRSVVZUSmpkMjFCUjI1MUlpd2lNVGMwT1RFM09EZzJNUzR6T0Rnd09UZ3lJbDA9IiwiZXhwIjoiMjAyNS0wNi0yMFQwMzowMTowMS4zODhaIiwicHVyIjoiY29va2llLnJlbWVtYmVyX3VzZXJfdG9rZW4ifX0%3D--e5b6084803aa1d1bc0bac3e9fdad24f156e55ba0; known_sign_in=NUJybEJmMTVtTWhobUVaNDZqNW81N21tdGpnVmJDNmg5SnQvUEdza0VNMGl2ZG1oR0N3TEdjaitVa1JKdmJTbEtOL3ZGOTNPK29NeXpSSjVDZDZPL3NodWJKUjBBQnIreUdyUFBpOVc5N3ZKYXJkNUNTMUM3bFlpbDhqSHpGT1gtLWNLT0ZjM3dRTXdiZDhRTTZtWklmY3c9PQ%3D%3D--35d9b24c795b9ea40c4e67e9b195fdacf6ddb434; _gitlab_session=6e007383d9ff5ff1557658578b1f7192; _sp_ses.c8c7=*; _sp_id.c8c7=0ce4a41c-9e6b-44ac-9872-2249e43282b8.1749178853.3.1749195525.1749185908.1cafef7c-61a5-473c-90cc-24c5fa5d53d8.ae1c329f-0bf7-42d6-9393-9383f602cc5d...0';
  const variables_attributes = [];
  let ref = `refs/heads/${branchMap.dev}`;
  let url = `https://gitlab.4medica.net/cxd/${projectMap.portal}${componentMap.client}/-/pipelines`;

  if (values) {
    let secret_value = '';
    const data = values.reduce((acc, item) => {
      let [key, ...itemValues] = item.split(' ');
      let itemValue = itemValues.join(' ');

      if (key.charAt(0) === '-') {
        key = key.substring(1);
      }

      switch (key) {
        case 'c':
        case 'components': {
          acc[keyMap[key]] = itemValue.split(' ');

          break;
        }

        default: {
          acc[keyMap[key]] = itemValue;

          break;
        }
      }

      return acc;
    }, {});

    if (data.components) {
      if (data.components.includes('client')) {
        url = `https://gitlab.4medica.net/cxd/${data.project || projectMap.portal}${componentMap.client}/-/pipelines`;
      }

      if (
        data.components.includes('administrator') ||
        data.components.includes('provider') ||
        data.components.includes('rest-api')
      ) {
        url = `https://gitlab.4medica.net/cxd/${data.project || projectMap.portal}${componentMap.backend}/-/pipelines`;

        if (data.components.includes('administrator')) {
          secret_value = 'administrator ';
        }

        if (data.components.includes('provider')) {
          secret_value = 'provider';
        }

        if (data.components.includes('administrator') || data.components.includes('provider')) {
          variables_attributes.push({
            variable_type: 'env_var',
            key: 'APPS',
            secret_value,
          });
        }
      }
    }

    if (data.branch) {
      ref = `refs/heads/${branchMap[data.branch] || data.branch}`;
    }
  }

  return { ref, variables_attributes, url, csrfToken, cookie };
};

module.exports = {
  getBuildVariables,
};
