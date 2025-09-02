const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname)

// Enable package exports for better-auth
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
