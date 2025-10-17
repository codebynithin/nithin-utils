const { execSync } = require('child_process');

const merge = async (values) => {
  const { source, target } = values;

  if (!source || !target) {
    console.error('Error: Both -source and -target branch parameters are required');
    console.log('Usage: nu merge -source <source branch> -target <target branch>');
    return;
  }

  try {
    console.log('Starting merge process...\n');

    execSync('git checkout master', { stdio: 'inherit' });
    execSync('git pull', { stdio: 'inherit' });
    execSync(`git checkout ${source}`, { stdio: 'inherit' });
    execSync('git pull', { stdio: 'inherit' });
    execSync(`git checkout ${target}`, { stdio: 'inherit' });
    execSync('git pull', { stdio: 'inherit' });
    execSync(`git merge ${source}`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });

    console.log('\n✓ Merge completed successfully!');
  } catch (error) {
    console.error('\n✗ Merge failed:', error.message);
    process.exit(1);
  }
};

module.exports = { merge };
