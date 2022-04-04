import { Cursors, Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { findClosestBlockRange } from 'tinymce/core/selection/MultiClickSelection';

import * as ViewBlock from '../../module/test/ViewBlock';

type RangePath = [startContainerPath: number[], startOffset: number, endContainerPath: number[], endOffset: number];

describe('browser.tinymce.core.selection.MultiClickSelectionTest', () => {
  describe('findClosestBlockRange test', () => {
    const DOM = DOMUtils.DOM;
    const viewBlock = ViewBlock.bddSetup();
    const getRoot = viewBlock.get;
    const setupHtml = viewBlock.update;

    const resolveRange = (args: RangePath): Range => {
      const root = SugarElement.fromDom(getRoot());
      const startContainer = Cursors.calculateOne(root, args[0]);
      const endContainer = Cursors.calculateOne(root, args[2]);
      const rng = DOM.createRng();
      rng.setStart(startContainer.dom, args[1]);
      rng.setEnd(endContainer.dom, args[3]);
      return rng;
    };

    const assertRange = (expected: Range, actual: Range) => {
      assert.strictEqual(actual.startContainer, expected.startContainer, 'startContainers should be equal');
      assert.strictEqual(actual.startOffset, expected.startOffset, 'startOffset should be equal');
      assert.strictEqual(actual.endContainer, expected.endContainer, 'endContainer should be equal');
      assert.strictEqual(actual.endOffset, expected.endOffset, 'endOffset should be equal');
    };

    const testFindClosestBlockRange = (startRngPath: RangePath, expectedRngPath: RangePath) =>
      assertRange(resolveRange(expectedRngPath), findClosestBlockRange(resolveRange(startRngPath), getRoot()));

    it('TINY-8215: Should return the range with the whole text content of the block', () => {
      setupHtml('<p>aaa bIb ccc</p>');
      testFindClosestBlockRange(
        [[ 0, 0 ], 4, [ 0, 0 ], 7 ],
        [[ 0, 0 ], 0, [ 0, 0 ], 11 ]
      );
    });

    it('TINY-8215: Should return the range expanded from the block start to the next closest <br> element', () => {
      setupHtml('<p>aaa bIb <strong>ccc</strong><br>ddd</p>');
      testFindClosestBlockRange(
        [[ 0, 0 ], 3, [ 0, 0 ], 6 ],
        [[ 0, 0 ], 0, [ 0, 1, 0 ], 3 ]
      );
    });

    it('TINY-8215: Should return the range expanded from <br> element to end of the block', () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc ddd</p>');
      testFindClosestBlockRange(
        [[ 0, 3 ], 1, [ 0, 3 ], 4 ],
        [[ 0, 2, 0 ], 0, [ 0, 3 ], 8 ]
      );
    });

    it('TINY-8215: Should return the range expanded between the two <br> elements', () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc <strong>ddd</strong><br>eee</p>');
      testFindClosestBlockRange(
        [[ 0, 3 ], 1, [ 0, 3 ], 4 ],
        [[ 0, 2, 0 ], 0, [ 0, 4, 0 ], 3 ]
      );
    });

    it('TINY-8215: Should return the range expanded beween the block start and <br> elememt when the start range is exacly the <br> element', () => {
      setupHtml('<p>aaa bbb ccc<br>ddd</p>');
      testFindClosestBlockRange(
        [[ 0 ], 1, [ 0 ], 2 ],
        [[ 0, 0 ], 0, [ 0 ], 2 ]
      );
    });

    it('TINY-8215: Should set start of the range before cef element if the first caret candidate is within it', () => {
      setupHtml('<p><span contenteditable="false"><em>aaa</em></span> bIb</p>');
      testFindClosestBlockRange(
        [[ 0, 1 ], 1, [ 0, 1 ], 4 ],
        [[ 0 ], 0, [ 0, 1 ], 4 ]
      );
    });

    it('TINY-8215: Should set end of the range right after cef element if the last caret candidate is within it', () => {
      setupHtml('<p>aIa <span contenteditable="false">bbb</span><br>ccc</p>');
      testFindClosestBlockRange(
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 0, 0 ], 0, [ 0 ], 2 ]
      );
    });

    it('TINY-8215: Should restrict range up to the cet element scope', () => {
      setupHtml('<p contenteditable="false">aaa<span contenteditable="true">bbb cIc ddd</span>eee</p>');
      testFindClosestBlockRange(
        [[ 0, 1, 0 ], 4, [ 0, 1, 0 ], 7 ],
        [[ 0, 1, 0 ], 0, [ 0, 1, 0 ], 11 ]
      );
    });

    it('TINY-8215: Should include nested cef element to range scoped with cet element', () => {
      setupHtml('<p contenteditable="true">aaa<span contenteditable="false">bbb ccc ddd</span>eee</p>');
      testFindClosestBlockRange(
        [[ 0 ], 1, [ 0 ], 2 ],
        [[ 0, 0 ], 0, [ 0, 2 ], 3 ]
      );
    });
  });

  describe('fake multi click browser test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

    const fakeMultiClick = (clickCount: number, target: HTMLElement) => {
      Mouse.mouseDown(SugarElement.fromDom(target), { detail: clickCount });
    };

    for (let clickCount = 3; clickCount <= 10; clickCount++) {
      it(`Normalize selection from index text node to text node offsets with ${clickCount} clicks`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p>');
        const target = editor.dom.select('p')[0];
        TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
        fakeMultiClick( clickCount, target);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
      });

      it(`Normalize selection start in text node end after paragraph with ${clickCount} clicks`, () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p>');
        const target = editor.dom.select('p')[0];
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [], 1);
        fakeMultiClick( clickCount, target);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
      });
    }

    it('TINY-8215: Should select the content after <br> element', () => {
      const editor = hook.editor();
      editor.setContent('<p><em>aaa</em><br><strong>cIc</strong> ddd</p>');
      const target = editor.dom.select('strong')[0];
      TinySelections.setSelection(editor, [ 0, 2, 0 ], 0, [ 0, 2, 0 ], 3);
      fakeMultiClick(3, target);
      TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 0, [ 0, 3 ], 4);
    });

    it('TINY-8215: Selection should not be collapsed before noneditable content', () => {
      const editor = hook.editor();
      editor.setContent('<p>aaa bbb</p><div contenteditable="false"><p contenteditable="true">ccc</p></div>');
      const target = editor.dom.select('p')[0];
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
      fakeMultiClick(3, target);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 7);
    });
  });
});
