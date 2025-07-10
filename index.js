#!/usr/bin/env node
// const { init } = require('./services/init-config');
const { processArgs } = require('./services/process-commands.js');
const initNpm = async () => {
  let [type, ...value] = (process.argv || []).splice(2);

  if (!type) {
    type = 'help';
  }

  /* if (type === 'init') {
    init();
  } else { */
  processArgs(type, value?.join(' '));
  // }
};

initNpm();

module.exports = initNpm;
