import { assert } from 'chai';
import { describe, it } from 'mocha';

import Settings from 'ephox/oxide-icons-tools/Configuration';

describe('oxide-icons-tools.core.Configuration', () => {
  it('should merge new options with default options', () => {
    const options = Settings.getPluginOptions({
      name: 'my-icon-pack',
      diffDefault: true,
      svgo: {
        plugins: [
          'removeXMLNS'
        ]
      }
    });

    // Expect options to be overridden
    assert.equal(options.name, 'my-icon-pack');
    assert.isTrue(options.diffDefault);
    assert.include(options.svgo?.plugins ?? [], 'removeXMLNS');

    // Expect default options to exist
    assert.isString(options.licenseHeader);
    assert.isArray(options.diffIgnore);
  });

  it('should handle custom plugins', () => {
    const options = Settings.getPluginOptions({
      name: 'my-icon-pack',
      svgo: {
        plugins: [
          'removeXMLNS',
          'removeDimensions'
        ]
      }
    });

    // Expect plugins to be in options
    assert.include(options.svgo?.plugins ?? [], 'removeXMLNS');
    assert.include(options.svgo?.plugins ?? [], 'removeDimensions');
  });
});