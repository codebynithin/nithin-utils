const { execSync } = require('child_process');
const os = require('os');
const { backupConfig, restoreConfig } = require('./utils');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

/**
 * Execute MongoDB restore from local backup to Docker container
 * @param {Object} config - Restore configuration
 * @param {string} config.containerName - Name of the Docker container (default: 'mongodb')
 * @param {string} config.localBackupPath - Local path where backup is stored (default: '~/backups/mongo')
 * @param {string} config.containerBackupPath - Path inside container for backup (default: '/data/backup')
 */
const executeMongoRestore = async (config) => {
  const {
    containerName = 'mongodb',
    localBackupPath = os.homedir() + '/backups/mongo',
    containerBackupPath = '/data/backup',
  } = config;

  try {
    const expandedLocalPath = localBackupPath.replace('~', os.homedir());

    console.log(`\nStarting MongoDB restore to container: ${containerName}`);

    // Step 1: Copy backup from local to Docker container
    const copyCommand = `docker cp ${expandedLocalPath} ${containerName}:${containerBackupPath}`;

    console.log(`Copying backup to container...`);
    execSync(copyCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Backup copied to container${colors.reset}`);

    // Step 2: Execute mongorestore inside the container
    const restoreCommand = `docker exec -it ${containerName} mongorestore ${containerBackupPath}`;

    console.log('Executing mongorestore...');
    execSync(restoreCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Mongorestore completed successfully${colors.reset}`);

    // Step 3: Remove backup data from container
    const cleanupCommand = `docker exec -it ${containerName} rm -rf ${containerBackupPath}`;

    console.log('Cleaning up backup data from container...');
    execSync(cleanupCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Backup data removed from container${colors.reset}`);

    console.log(`${colors.green}Restore completed successfully!${colors.reset}\n`);

    return { success: true };
  } catch (error) {
    console.error(`${colors.red}Error during MongoDB restore: ${error.message}${colors.reset}`);
    throw error;
  }
};

/**
 * Execute MongoDB backup using kubectl
 * @param {Object} config - Backup configuration
 * @param {string} config.pod - Name of the pod
 * @param {string} config.username - MongoDB username
 * @param {string} config.password - MongoDB password
 * @param {string} config.database - Database name (used for authentication and backup)
 * @param {string} config.backupPath - Path inside pod for backup (default: '/data/backup')
 * @param {string} config.localBackupPath - Local path to copy backup (default: '~/backups/mongo/')
 */
const executeMongoBackup = async (config) => {
  const {
    pod,
    username,
    password,
    database,
    backupPath = '/data/backup',
    localBackupPath = '~/backups/mongo/',
  } = config;

  try {
    console.log(`\nStarting MongoDB backup for pod: ${pod}, database: ${database}`);

    const mongodumpCommand = `kubectl exec -it ${pod} -- mongodump --username ${username} --password ${password} --authenticationDatabase ${database} --db ${database} --out ${backupPath}`;

    console.log('Executing mongodump...');
    execSync(mongodumpCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Mongodump completed successfully${colors.reset}`);

    const expandedLocalPath = localBackupPath.replace('~', os.homedir());
    const destinationPath = `${expandedLocalPath}${database}`;
    const copyCommand = `kubectl cp ${pod}:${backupPath}/${database} ${destinationPath}`;
    const cleanupCommand = `kubectl exec -it ${pod} -- rm -rf ${backupPath}`;

    console.log(`Copying backup to ${destinationPath}...`);
    execSync(copyCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Backup copied successfully${colors.reset}`);

    console.log('Cleaning up backup data from pod...');
    execSync(cleanupCommand, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Backup data removed from pod${colors.reset}`);

    console.log(
      `${colors.green}Backup completed! Files saved to: ${destinationPath}${colors.reset}\n`,
    );

    return { success: true, localPath: destinationPath };
  } catch (error) {
    console.error(`${colors.red}Error during MongoDB backup: ${error.message}${colors.reset}`);
    throw error;
  }
};

const backup = async (values) => {
  if (!backupConfig) {
    console.error(`${colors.red}BACKUP_CONFIG not found in environment variables${colors.reset}`);
    return;
  }

  let projects;

  if (values.project) {
    projects = values.project.split(' ');
  } else {
    projects = Object.keys(backupConfig);
  }

  console.log(`Starting backup process for projects: ${projects.join(', ')}`);

  for (const project of projects) {
    const projectConfigs = backupConfig[project];

    if (!projectConfigs || !Array.isArray(projectConfigs)) {
      console.warn(`No configuration found for project: ${project}`);

      continue;
    }

    console.log(`\n========================================`);
    console.log(`Processing backup for project: ${project}`);
    console.log(`========================================`);

    for (const dbConfig of projectConfigs) {
      try {
        await executeMongoBackup(dbConfig);
      } catch (error) {
        console.error(
          `${colors.red}Failed to backup database ${dbConfig.database} for project ${project}${colors.reset}`,
        );
      }
    }
  }

  console.log('\n========================================');
  console.log(`${colors.green}Backup process completed!${colors.reset}`);
  console.log('========================================');

  console.log(`\n========================================`);
  console.log(`Starting restore process for projects: ${projects.join(', ')}`);
  console.log(`========================================`);

  await executeMongoRestore(restoreConfig);

  console.log('\n========================================');
  console.log(`${colors.green}Restore process completed!${colors.reset}`);
  console.log('========================================');
};

module.exports = { backup };
