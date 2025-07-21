#!/usr/bin/env node
const { processArgs } = require('./services/process-commands.js');
const initNpm = async () => {
  let [type, ...value] = (process.argv || []).splice(2);

  if (!type) {
    type = 'help';
  }

  processArgs(type, value?.join(' '));
};

initNpm();

module.exports = initNpm;
