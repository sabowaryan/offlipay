const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add support for .wasm files
config.resolver.assetExts.push('wasm');

// Add wasm to source extensions for better resolution
config.resolver.sourceExts.push('wasm');

// Enable package exports for better module resolution
config.resolver.unstable_enablePackageExports = true;

// Prioritize browser field for web compatibility
config.resolver.resolverMainFields = ['browser', 'main', 'module'];

// Add specific resolver for Sentry modules
config.resolver.alias = {
  ...config.resolver.alias,
  '@sentry/core': require.resolve('@sentry/core'),
  '@sentry/utils': require.resolve('@sentry/utils'),
};

// Add node_modules resolution fallback
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;