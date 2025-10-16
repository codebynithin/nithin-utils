const axios = require('axios');
const { gitlabToken, gitlabUri } = require('./utils');

/**
 * Trigger a GitLab pipeline for a specific project
 * @param {string} projectId - The GitLab project ID or URL-encoded path
 * @param {string} ref - The branch or tag name to run the pipeline on
 * @param {Object} variables - Optional pipeline variables (key-value pairs)
 * @returns {Promise<Object>} Pipeline object with id, status, web_url, etc.
 */
const triggerPipeline = async (projectId, ref, variables = {}) => {
  try {
    const url = `${gitlabUri}/api/v4/projects/${encodeURIComponent(projectId)}/pipeline`;
    const data = {
      ref,
      variables: Object.entries(variables).map(([key, value]) => ({ key, value })),
    };
    const response = await axios.post(url, data, {
      headers: {
        'PRIVATE-TOKEN': gitlabToken,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Pipeline triggered successfully: ${response.data.web_url}`);
    return response.data;
  } catch (error) {
    console.error('Error triggering pipeline:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get details of a specific job in a GitLab project
 * @param {string} projectId - The GitLab project ID or URL-encoded path
 * @param {string} jobId - The job ID
 * @returns {Promise<Object>} Job object with id, status, stage, name, etc.
 */
const getJob = async (projectId, jobId) => {
  try {
    const url = `${gitlabUri}/api/v4/projects/${encodeURIComponent(projectId)}/jobs/${jobId}`;
    const response = await axios.get(url, { headers: { 'PRIVATE-TOKEN': gitlabToken } });

    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get the trace (logs) of a specific job in a GitLab project
 * @param {string} projectId - The GitLab project ID or URL-encoded path
 * @param {string} jobId - The job ID
 * @returns {Promise<string>} Job trace/logs as a string
 */
const getJobTrace = async (projectId, jobId) => {
  try {
    const url = `${gitlabUri}/api/v4/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/trace`;
    const response = await axios.get(url, { headers: { 'PRIVATE-TOKEN': gitlabToken } });

    return response.data;
  } catch (error) {
    console.error('Error fetching job trace:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  triggerPipeline,
  getJob,
  getJobTrace,
};
