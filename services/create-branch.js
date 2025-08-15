const { execSync } = require('child_process');

const createBranch = async (values) => {
  console.log('Creating branch: ', values);
  if (!values.task || !values.type || !values.description) {
    console.log('Invalid branch parameters');

    return;
  }

  if (isNaN(values.task)) {
    console.log('Invalid task number');

    return;
  }

  if (!values.project) {
    values.project = 'portal';
  }

  const branchName = `${values.project}-${values.task}-${values.type}-${values.description.toLowerCase().replace(/\s/g, '-')}`;

  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error creating branch:', error.message);
  }
};

module.exports = { createBranch };
