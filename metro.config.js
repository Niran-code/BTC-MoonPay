const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('./customTransformer.js'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['js', 'ts', 'tsx', 'json'], // <-- Add 'json' here
    assetExts: ['txt', 'png', 'jpg'],
  },
};

// Log the current timestamp for debugging
console.log('Metro config loaded on May 14, 2025, 04:27 PM IST');

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
