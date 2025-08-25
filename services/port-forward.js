const { gitlabToken, projectIdMap, mrPrompt, mrLang, mrApiUri } = require('./utils');
const axios = require('axios');

const executeMergeRequestReview = async (values) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${mrApiUri}/${projectIdMap[values.project]}/mergeid/${values.mergeId}`,
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      language: mrLang,
      gitlabToken,
      llmModel: 'claude',
      prompt: mrPrompt,
    }),
  };

  return await axios
    .request(config)
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);

      return null;
    });
};

const mrAIReview = async (values) => {
  if (!projectIdMap[values.project]) {
    console.log('Invalid project name');

    return;
  }

  try {
    console.log('Executing merge request review...');

    const result = await executeMergeRequestReview(values);

    if (result) {
      console.log('Merge request review completed successfully');
    } else {
      console.log('Merge request review failed');
    }
  } catch (error) {
    console.error('Error port forwarding:', error.message);
  }
};

module.exports = { mrAIReview };
