import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SandHTMLElement from 'ephox/sand/api/SandHTMLElement';

describe('HtmlElementTest', () => {
  const span = document.createElement('div');

  it('SandHTMLElement', () => {
    assert.isFalse(SandHTMLElement.isPrototypeOf(null));
    assert.isFalse(SandHTMLElement.isPrototypeOf(undefined));
    assert.isFalse(SandHTMLElement.isPrototypeOf('a string'));
    assert.isFalse(SandHTMLElement.isPrototypeOf({}));
    assert.isTrue(SandHTMLElement.isPrototypeOf(span));
  });
});
