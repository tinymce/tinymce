import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.api.dom.RangeUtilsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const createRange = (dom: DOMUtils, sc: Node, so: number, ec: Node, eo: number) => {
    const rng = dom.createRng();
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
    const editor = hook.editor();
    editor.setContent('a<a href="#">b</a>c');

    const firstChild = editor.getBody().firstChild as Node;
    const rng1 = createRange(editor.dom, firstChild, 1, firstChild, 1);
    const rng1Clone = rng1.cloneRange();
    assert.isFalse(RangeUtils(editor.dom).normalize(rng1));
    assertRange(rng1Clone, rng1);

    const lastChild = editor.getBody().lastChild as Node;
    const rng2 = createRange(editor.dom, lastChild, 0, lastChild, 0);
    const rng2Clone = rng2.cloneRange();
    assert.isFalse(RangeUtils(editor.dom).normalize(rng2));
    assertRange(rng2Clone, rng2);
  });
});
