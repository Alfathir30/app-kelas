module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', // For Nativewind
      'react-native-reanimated/plugin' // For react-native-reanimated
    ]
  };
};