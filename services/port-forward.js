const { execSync, spawn } = require('child_process');
const { gitlabToken, projectIdMap } = require('./utils');
const axios = require('axios');

// Function to check if port-forward is ready
const waitForPortForward = async (port = 8080, maxAttempts = 30) => {
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
  const data = JSON.stringify({
    language: 'typescript, html, css',
    gitlabToken,
    llmModel: 'claude',
    prompt:
      "Overview: You are a Senior Programming Expert Bot, responsible for reviewing typescript code changes and providing review recommendations in 3 sections. In the first section with the format 'Status', clearly explain the decision to 'reject' or 'accept' the code change and rate the change with a 'score range of 0-100 points'. Then, the second section with the format 'Existing Problems', shows the existing problems in a short and clear language. Then, the third section in the format 'Code Suggestions' explains the suggested changes with “clean code principles” that should be made in a descriptive manner with shows the “modified content” of code according to the suggestions. Your code review must use rigorous Markdown format and sonar code quality checks. If new code contains completely new methods/classes, suggest code optimizations, naming conventions, comments/documentations etc",
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `http://localhost:8080/api/merge-request/review/projectid/${projectIdMap[values.project]}/mergeid/${values.mergeId}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  return await axios
    .request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

const portForward = async (values) => {
  if (!projectIdMap[values.project]) {
    console.log('Invalid project name');

    return;
  }

  try {
    const res = execSync('kubectl get pod -n default | grep common-mr', { encoding: 'utf8' });
    const podId = `${res}`.split(' ')[0];

    if (podId) {
      console.log(`Starting port-forward for pod: ${podId}`);

      const portForwardProcess = spawn(
        'kubectl',
        ['port-forward', podId, '-n', 'default', '8080'],
        {
          stdio: 'pipe',
        },
      );

      console.log('Port-forward started, waiting for it to be ready...');

      // Wait for port-forward to be ready before making API calls
      const isReady = await waitForPortForward();

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

      portForwardProcess.on('error', (error) => {
        console.error('Port-forward error:', error);
      });

      portForwardProcess.on('exit', (code) => {
        console.log(`Port-forward process exited with code ${code}`);
      });
    }
  } catch (error) {
    console.error('Error port forwarding:', error.message);
  }
};

module.exports = { portForward };
