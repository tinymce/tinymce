// TODO: add migration URL in ToggleToolbarDrawer message #TINY-12087
const deprecatedFeatures = {
  skipFocus: 'ToggleToolbarDrawer skipFocus is deprecated see migration guide: ....',
};

const logFeatureDeprecationWarning = (feature: keyof typeof deprecatedFeatures): void => {
  // eslint-disable-next-line no-console
  console.warn(deprecatedFeatures[feature], new Error().stack);
};

export {
  logFeatureDeprecationWarning
};