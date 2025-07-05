const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .wasm files
config.resolver.assetExts.push('wasm');

// Add wasm to source extensions for better resolution
config.resolver.sourceExts.push('wasm');

// Enable package exports for better module resolution
config.resolver.unstable_enablePackageExports = true;

// Prioritize browser field for web compatibility
config.resolver.resolverMainFields = ['browser', 'main', 'module'];

module.exports = config;