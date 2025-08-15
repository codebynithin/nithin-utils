const { execSync, spawn } = require('child_process');
const { gitlabToken, projectIdMap, mrPrompt, mrLang } = require('./utils');
const axios = require('axios');

// Function to check if port-forward is ready
const waitFormrAIReview = async (port = 8080, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`http://localhost:${port}`, { timeout: 1000 });
      console.log('Port-forward is ready!');
      return true;
    } catch (error) {
      console.log(`Waiting for port-forward... attempt ${i + 1}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('Port-forward failed to become ready');
  return false;
};

const executeMergeRequestReview = async (values) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `http://localhost:8080/api/merge-request/review/projectid/${projectIdMap[values.project]}/mergeid/${values.mergeId}`,
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
    const res = execSync('kubectl get pod -n default | grep common-mr', { encoding: 'utf8' });
    const podId = `${res}`.split(' ')[0];

    if (podId) {
      console.log(`Starting port-forward for pod: ${podId}`);

      const mrAIReviewProcess = spawn('kubectl', ['port-forward', podId, '-n', 'default', '8080'], {
        stdio: 'pipe',
      });

      console.log('Port-forward started, waiting for it to be ready...');

      // Wait for port-forward to be ready before making API calls
      const isReady = await waitFormrAIReview();

      if (isReady) {
        console.log('Executing merge request review...');

        const result = await executeMergeRequestReview(values);

        if (result) {
          console.log('Merge request review completed successfully');
        } else {
          console.log('Merge request review failed');
        }
      } else {
        console.log('Port-forward not ready, skipping API call');
      }

      mrAIReviewProcess.on('error', (error) => {
        console.error('Port-forward error:', error);
      });

      mrAIReviewProcess.on('exit', (code) => {
        console.log(`Port-forward process exited with code ${code}`);
      });
    }
  } catch (error) {
    console.error('Error port forwarding:', error.message);
  }
};

module.exports = { mrAIReview };
