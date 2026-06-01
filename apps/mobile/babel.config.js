module.exports = function (api) {
  api.cache(true);

  // Em monorepos com npm workspaces, expo-router pode ficar em
  // apps/mobile/node_modules em vez de ser hoistado para a raiz.
  // babel-preset-expo verifica hasModule('expo-router') a partir de
  // lifegame/node_modules/ e não encontra — então não registra o
  // expoRouterBabelPlugin, e EXPO_ROUTER_APP_ROOT nunca é inlinado.
  // Solução: adicionar o plugin diretamente aqui.
  const { expoRouterBabelPlugin } = require('babel-preset-expo/build/expo-router-plugin');

  return {
    presets: ['babel-preset-expo'],
    plugins: [expoRouterBabelPlugin],
  };
};
