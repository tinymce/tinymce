import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';

import * as ViewBlock from '../../../module/test/ViewBlock';

describe('browser.tinymce.core.api.dom.RangeUtilsTest', () => {
  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock.bddSetup();

  const createRange = (sc: Node, so: number, ec: Node, eo: number) => {
    const rng = DOM.createRng();
    rng.setStart(sc, so);
    rng.setEnd(ec, eo);
    return rng;
  };

  const assertRange = (expected: Range, actual: Range) => {
    assert.strictEqual(actual.startContainer, expected.startContainer, 'startContainers should be equal');
    assert.strictEqual(actual.startOffset, expected.startOffset, 'startOffset should be equal');
    assert.strictEqual(actual.endContainer, expected.endContainer, 'endContainer should be equal');
    assert.strictEqual(actual.endOffset, expected.endOffset, 'endOffset should be equal');
  };

  it(`don't normalize at anchors`, () => {
    viewBlock.update('a<a href="#">b</a>c');

    const firstChild = viewBlock.get().firstChild as Node;
    const rng1 = createRange(firstChild, 1, firstChild, 1);
    const rng1Clone = rng1.cloneRange();
    assert.isFalse(RangeUtils(DOM).normalize(rng1));
    assertRange(rng1Clone, rng1);

    const lastChild = viewBlock.get().lastChild as Node;
    const rng2 = createRange(lastChild, 0, lastChild, 0);
    const rng2Clone = rng2.cloneRange();
    assert.isFalse(RangeUtils(DOM).normalize(rng2));
    assertRange(rng2Clone, rng2);
  });
});
