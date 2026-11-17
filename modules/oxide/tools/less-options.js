const LessPluginPresetEnv = require('less-plugin-preset-env');

// Only these skins are built with custom properties so far.
const CUSTOM_PROPERTY_SKINS = [ 'default', 'dark' ];

const presetEnv = new LessPluginPresetEnv({
  browsers: [ 'last 2 Safari versions', 'last 2 iOS major versions', 'last 2 Chrome versions', 'Firefox ESR' ],
  grid: 'no-autoplace'
});

const lessOptions = (paths) => ({
  relativeUrls: true,
  math: 'parens-division',
  plugins: [ presetEnv ],
  paths
});

module.exports = { CUSTOM_PROPERTY_SKINS, lessOptions };
