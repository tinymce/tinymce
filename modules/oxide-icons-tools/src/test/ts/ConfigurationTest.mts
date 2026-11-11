import { expect } from 'chai';
import { describe } from 'mocha';
import type { PresetDefault } from 'svgo';

import SettingsImport from '../../main/ts/Configuration.js';

type SettingsType = typeof SettingsImport extends { default?: infer Default } ? Default : typeof SettingsImport;
// Configuration.ts still emits CJS, so ESM tests may receive the CJS wrapper.
const Settings = ((SettingsImport as unknown as { default?: SettingsType }).default ?? SettingsImport) as SettingsType;

describe('ConfigurationTest', () => {
  it('should merge new options with default options', () => {
    const options = Settings.getPluginOptions({
      name: 'my-icon-pack',
      diffDefault: true,
      svgo: {
        plugins: [{ name: 'removeXMLNS' }]
      }
    });

    // Expect the default plugins to be enabled
    const pluginNames = options.svgo.plugins?.map((plugin) => typeof plugin === 'string' ? plugin : plugin.name);
    expect(pluginNames).to.have.members([
      'removeXMLNS',
      'removeTitle',
      'removeAttrs',
      'convertStyleToAttrs',
      'preset-default'
    ]);

    // Expect options to be overridden
    expect(options.name).to.to.equal('my-icon-pack');
    expect(options.diffDefault).to.to.equal(true);
    expect(options.svgo.plugins).to.deep.include({ name: 'removeXMLNS' });

    // Expect default options to exist (just testing a subset)
    expect(options.diffIgnore).to.be.length(0);
    expect(options.svgo.floatPrecision).to.equal(1);
  });

  it('should merge the default plugin overrides', () => {
    const options = Settings.getPluginOptions({
      name: 'my-icon-pack',
      diffDefault: true,
      svgo: {
        plugins: [{
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false
            }
          }
        }]
      }
    });

    const defaults = options.svgo.plugins?.find((plugin) => typeof plugin !== 'string' && plugin.name === 'preset-default');
    expect(defaults).to.be.an('object');
    const overrides = (defaults as PresetDefault).params?.overrides;
    expect(overrides).to.have.property('removeViewBox');
  });
});
