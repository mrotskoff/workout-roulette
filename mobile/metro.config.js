const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// For expo-sqlite web support, we need to handle WASM files
// Remove 'wasm' from sourceExts if it's there, and add to assetExts
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'wasm');
config.resolver.assetExts.push('wasm');

module.exports = config;

