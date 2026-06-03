const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const webFallbacks = {
      '@shopify/react-native-skia': './src/utils/web-fallbacks/skia.web',
      'expo-haptics': './src/utils/web-fallbacks/haptics.web',
      'expo-blur': './src/utils/web-fallbacks/blur.web',
      'react-native-purchases': './src/utils/web-fallbacks/purchases.web',
      'expo-location': './src/utils/web-fallbacks/location.web',
      'react-native-maps': './src/utils/web-fallbacks/maps.web',
    };

    if (webFallbacks[moduleName]) {
      return {
        filePath: path.resolve(__dirname, webFallbacks[moduleName] + (moduleName === 'expo-blur' || moduleName === 'react-native-maps' ? '.tsx' : '.ts')),
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
