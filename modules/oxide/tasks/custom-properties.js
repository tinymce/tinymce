const path = require('node:path');

const { compileSkin, buildManifest, buildTypes, buildManifestTypes, missingFromDefault } = require('../tools/custom-properties/manifest');
const { CUSTOM_PROPERTY_SKINS } = require('../tools/less-options');

// Generates the custom property manifests and their TypeScript types. Fails the build on
// undeclared properties (same check as custom-properties-check).
module.exports = function (grunt) {
  grunt.registerTask('generateCustomProperties', 'Generate the CSS custom property manifest', function () {
    const done = this.async();
    const outDir = './build/custom-properties';

    Promise.all(CUSTOM_PROPERTY_SKINS.map(async (skin) => {
      const compiled = await compileSkin(skin);
      const manifest = buildManifest({ ...compiled, skin });
      grunt.file.write(path.join(outDir, skin, 'skin.css'), compiled.css);
      grunt.file.write(path.join(outDir, `${skin}.json`), JSON.stringify(manifest, null, 2) + '\n');
      // Types come from the default skin only: other skins are expected to override the
      // values of the default skin's properties, not declare new ones (see missingFromDefault).
      if (skin === 'default') {
        grunt.file.write(path.join(outDir, 'types.ts'), buildTypes(manifest));
        grunt.file.write(path.join(outDir, 'manifest.ts'), buildManifestTypes());
      }
      return manifest;
    })).then((manifests) => {
      grunt.log.ok(`Custom property manifests: ${manifests.map((m) => `${m.skin} (${Object.keys(m.properties).length})`).join(', ')}`);
      missingFromDefault(manifests).forEach(({ skin, name, location }) => {
        grunt.log.warn(`${skin}: ${name} is not declared by the default skin, so it is missing from types.ts (${location})`);
      });
      const undeclared = manifests.flatMap((m) => m.issues.undeclared.map((issue) => ({ ...issue, skin: m.skin })));
      undeclared.forEach(({ skin, name, locations }) => {
        grunt.log.error(`${skin}: ${name} is referenced but never declared, at ${locations.join('; ')}`);
      });
      if (undeclared.length > 0) {
        grunt.log.error('Declare the property, fix the name, or, if JavaScript sets it at runtime, add it to RUNTIME_PROPERTIES in tools/custom-properties/manifest.js.');
      }
      done(undeclared.length === 0);
    }, (err) => {
      grunt.log.error(err);
      done(false);
    });
  });
};
