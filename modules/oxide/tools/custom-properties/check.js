// Fails when a `var(--*)` reference points at a custom property that no skin rule
// declares. Such a typo is invisible to css-parity: the var() is invalid, so the
// LESS fallback wins and the flag-on and flag-off computed values stay identical.
// Declared-but-unused properties, and properties missing from the default skin (and so
// from types.ts), are reported as warnings.
//
// Usage, from editor/modules/oxide/: bun run custom-properties-check
const { CUSTOM_PROPERTY_SKINS } = require('../less-options');
const { compileSkin, buildManifest, missingFromDefault } = require('./manifest');

const run = async () => {
  const manifests = await Promise.all(CUSTOM_PROPERTY_SKINS.map(async (skin) => buildManifest({ ...(await compileSkin(skin)), skin })));
  let failed = false;

  const missing = missingFromDefault(manifests);

  manifests.forEach((manifest) => {
    const { undeclared, unused } = manifest.issues;
    console.log(`\n${manifest.skin}: ${Object.keys(manifest.properties).length} declared custom properties`);

    undeclared.forEach(({ name, locations }) => {
      failed = true;
      console.log(`  error    ${name} is referenced but never declared`);
      locations.forEach((l) => console.log(`             at ${l}`));
    });
    unused.forEach(({ name, location }) => console.log(`  warning  ${name} is declared but never referenced (${location})`));
    missing.filter((m) => m.skin === manifest.skin).forEach(({ name, location }) =>
      console.log(`  warning  ${name} is not declared by the default skin, so it is missing from types.ts (${location})`));
  });

  if (failed) {
    console.log('\nDeclare the property, fix the name, or, if JavaScript sets it at runtime, add it to RUNTIME_PROPERTIES in tools/custom-properties/manifest.js.');
    process.exitCode = 1;
  } else {
    console.log('\nAll referenced custom properties are declared.');
  }
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
