import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { findClosestBlockRange } from 'tinymce/core/selection/MultiClickSelection';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.MultiClickSelectionTest', () => {
  describe('findClosestBlockRange test', () => {
    const DOM = DOMUtils.DOM;
    const viewBlock = ViewBlock.bddSetup();
    const getRoot = viewBlock.get;
    const setupHtml = viewBlock.update;

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

    const testFindClosestBlockRange = (startRng: Range, expectedRng: Range) =>
      assertRange(expectedRng, findClosestBlockRange(startRng, getRoot()));

    it(`should return the range with the whole text content of the block`, () => {
      setupHtml('<p>aaa bIb ccc</p>');
      const textNode = getRoot().firstChild.firstChild;
      const startRng = createRange(textNode, 4, textNode, 7);
      const expectedRng = createRange(textNode, 0, textNode, 11);
      testFindClosestBlockRange(startRng, expectedRng);
    });

    it(`should return the range expanded from the block start to the next closest <br> element`, () => {
      setupHtml('<p>aaa bIb <strong>ccc</strong><br>ddd</p>');
      const firstTextNode = getRoot().firstChild.firstChild;
      const cccTextNode = getRoot().firstChild.childNodes[1].firstChild;
      const startRng = createRange(firstTextNode, 3, firstTextNode, 6);
      const expectedRng = createRange(firstTextNode, 0, cccTextNode, 3);
      testFindClosestBlockRange(startRng, expectedRng);
    });

    it(`should return the range expanded from <br> element to end of the block`, () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc ddd</p>');
      const lastTextNode = getRoot().firstChild.lastChild;
      const bbbTextNode = getRoot().firstChild.childNodes[2].firstChild;
      const startRng = createRange(lastTextNode, 1, lastTextNode, 4);
      const expectedRng = createRange(bbbTextNode, 0, lastTextNode, 8);
      testFindClosestBlockRange(startRng, expectedRng);
    });

    it(`should return the range expanded between the two <br> elements`, () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc <strong>ddd</strong><br>eee</p>');
      const clickTextNode = getRoot().firstChild.childNodes[3];
      const bbbTextNode = getRoot().firstChild.childNodes[2].firstChild;
      const dddTextNode = getRoot().firstChild.childNodes[4].firstChild;
      const startRng = createRange(clickTextNode, 0, clickTextNode, 5);
      const expectedRng = createRange(bbbTextNode, 0, dddTextNode, 3);
      testFindClosestBlockRange(startRng, expectedRng);
    });

    it(`should return range expanded beween the block start and <br> elememt when the start range is exacly the <br> element`, () => {
      setupHtml('<p>aaa bbb ccc<br>ddd</p>');
      const pNode = getRoot().firstChild;
      const firstTextNode = getRoot().firstChild.firstChild;
      const startRng = createRange(pNode, 1, pNode, 2); // select exactly <br> element
      const expectedRng = createRange(firstTextNode, 0, pNode, 2);
      testFindClosestBlockRange(startRng, expectedRng);
    });
  });

  describe('fake multi click browser test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

    const fakeMultiClick = (editor: Editor, clickCount: number, target: HTMLElement) => {
      editor.dispatch('mousedown', { detail: clickCount, target } as unknown as MouseEvent);
    };

    for (let clickCount = 3; clickCount <= 10; clickCount++) {
      it(`Normalize selection from index text node to text node offsets with ${clickCount} clicks`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p>');
        const target = editor.dom.select('p')[0];
        TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
        fakeMultiClick(editor, clickCount, target);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
      });

      it(`Normalize selection start in text node end after paragraph with ${clickCount} clicks`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p>');
        const target = editor.dom.select('p')[0];
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [], 1);
        fakeMultiClick(editor, clickCount, target);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
      });
    }

    it(`should select the content after <br> element`, () => {
      const editor = hook.editor();
      editor.setContent('<p><em>aaa</em><br><strong>cIc</strong> ddd</p>');
      const target = editor.dom.select('strong')[0];
      TinySelections.setSelection(editor, [ 0, 2, 0 ], 0, [ 0, 2, 0 ], 3);
      fakeMultiClick(editor, 3, target);
      TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 0, [ 0, 3 ], 4);
    });

    it(`selection should not be collapsed before noneditable content`, () => {
      const editor = hook.editor();
      editor.setContent('<p>aaa bbb</p><div contenteditable="false"><p contenteditable="true">ccc</p></div>');
      const target = editor.dom.select('p')[0];
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
      fakeMultiClick(editor, 3, target);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 7);
    });
  });
});
