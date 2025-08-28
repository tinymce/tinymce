import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Namespace from 'ephox/katamari/api/Namespace';

describe('atomic.katamari.api.data.NamespaceTest', () => {
  it('NamespaceTest', () => {
    const styles = Namespace.css('ephox.test');
    const css = styles.resolve('doubletest');
    assert.equal(css, 'ephox-test-doubletest');
  });
});
