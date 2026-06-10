const migrationFrom7x = 'https://www.tiny.cloud/docs/tinymce/latest/migration-from-7x/';

const deprecatedFeatures = {
  skipFocus: `ToggleToolbarDrawer skipFocus is deprecated see migration guide: ${migrationFrom7x}`,
};

const logFeatureDeprecationWarning = (feature: keyof typeof deprecatedFeatures): void => {
  // eslint-disable-next-line no-console
  console.warn(deprecatedFeatures[feature], new Error().stack);
};

export {
  logFeatureDeprecationWarning
};