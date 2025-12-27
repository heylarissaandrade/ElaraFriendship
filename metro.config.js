const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const packagesDir = path.resolve(projectRoot, 'packages');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packagesDir];

config.resolver = {
  ...(config.resolver || {}),
  extraNodeModules: new Proxy({}, {
    get: (_target, name) => path.join(projectRoot, `node_modules/${name}`)
  }),
};

module.exports = config;
