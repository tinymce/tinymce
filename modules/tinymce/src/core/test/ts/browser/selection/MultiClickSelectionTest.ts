import { Cursors, Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Schema from 'tinymce/core/api/html/Schema';
import { findClosestBlockRange } from 'tinymce/core/selection/MultiClickSelection';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.MultiClickSelectionTest', () => {
  describe('findClosestBlockRange test', () => {
    const DOM = DOMUtils.DOM;
    const viewBlock = ViewBlock.bddSetup();
    const getRoot = viewBlock.get;
    const setupHtml = viewBlock.update;
    const baseSchema = Schema();

    const toDomRange = (path: Cursors.CursorPath): Range => {
      const root = SugarElement.fromDom(getRoot());
      const range = Cursors.calculate(root, path);
      const domRng = DOM.createRng();
      domRng.setStart(range.start.dom, range.soffset);
      domRng.setEnd(range.finish.dom, range.foffset);
      return domRng;
    };

    const assertRange = (expected: Range, actual: Range) => {
      assert.strictEqual(actual.startContainer, expected.startContainer, 'startContainers should be equal');
      assert.strictEqual(actual.startOffset, expected.startOffset, 'startOffset should be equal');
      assert.strictEqual(actual.endContainer, expected.endContainer, 'endContainer should be equal');
      assert.strictEqual(actual.endOffset, expected.endOffset, 'endOffset should be equal');
    };

    const testFindClosestBlockRange = (startRngPath: Cursors.CursorPath, expectedRngPath: Cursors.CursorPath) =>
      assertRange(toDomRange(expectedRngPath), findClosestBlockRange(toDomRange(startRngPath), getRoot(), baseSchema));

    it('TINY-8215: Should return the range with the whole text content of the block', () => {
      setupHtml('<p>aaa bIb ccc</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 0 ],
        soffset: 4,
        finishPath: [ 0, 0 ],
        foffset: 7
      }, {
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0, 0 ],
        foffset: 11
      });
    });

    it('TINY-8215: Should return the range expanded from the block start to the next closest <br> element', () => {
      setupHtml('<p>aaa bIb <strong>ccc</strong><br>ddd</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 0 ],
        soffset: 3,
        finishPath: [ 0, 0 ],
        foffset: 6
      }, {
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0, 1, 0 ],
        foffset: 3
      });
    });

    it('TINY-8215: Should return the range expanded from <br> element to end of the block', () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc ddd</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 3 ],
        soffset: 1,
        finishPath: [ 0, 3 ],
        foffset: 4
      }, {
        startPath: [ 0, 2, 0 ],
        soffset: 0,
        finishPath: [ 0, 3 ],
        foffset: 8
      });
    });

    it('TINY-8215: Should return the range expanded between the two <br> elements', () => {
      setupHtml('<p>aaa<br><em>bbb</em> cIc <strong>ddd</strong><br>eee</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 3 ],
        soffset: 1,
        finishPath: [ 0, 3 ],
        foffset: 4
      }, {
        startPath: [ 0, 2, 0 ],
        soffset: 0,
        finishPath: [ 0, 4, 0 ],
        foffset: 3
      });
    });

    it('TINY-8215: Should return the range expanded beween the block start and <br> elememt when the start range is exacly the <br> element', () => {
      setupHtml('<p>aaa bbb ccc<br>ddd</p>');
      testFindClosestBlockRange({
        startPath: [ 0 ],
        soffset: 1,
        finishPath: [ 0 ],
        foffset: 2
      }, {
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0 ],
        foffset: 2
      });
    });

    it('TINY-8215: Should set start of the range before cef element if the first caret candidate is within it', () => {
      setupHtml('<p><span contenteditable="false"><em>aaa</em></span> bIb</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 1 ],
        soffset: 1,
        finishPath: [ 0, 1 ],
        foffset: 4
      }, {
        startPath: [ 0 ],
        soffset: 0,
        finishPath: [ 0, 1 ],
        foffset: 4
      });
    });

    it('TINY-8215: Should set end of the range right after cef element if the last caret candidate is within it', () => {
      setupHtml('<p>aIa <span contenteditable="false">bbb</span><br>ccc</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0, 0 ],
        foffset: 3
      }, {
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0 ],
        foffset: 2
      });
    });

    it('TINY-8215: Should restrict range up to the cet element scope', () => {
      setupHtml('<p contenteditable="false">aaa<span contenteditable="true">bbb cIc ddd</span>eee</p>');
      testFindClosestBlockRange({
        startPath: [ 0, 1, 0 ],
        soffset: 4,
        finishPath: [ 0, 1, 0 ],
        foffset: 7
      }, {
        startPath: [ 0, 1, 0 ],
        soffset: 0,
        finishPath: [ 0, 1, 0 ],
        foffset: 11
      });
    });

    it('TINY-8215: Should include nested cef element to range scoped with cet element', () => {
      setupHtml('<p contenteditable="true">aaa<span contenteditable="false">bbb ccc ddd</span>eee</p>');
      testFindClosestBlockRange({
        startPath: [ 0 ],
        soffset: 1,
        finishPath: [ 0 ],
        foffset: 2
      }, {
        startPath: [ 0, 0 ],
        soffset: 0,
        finishPath: [ 0, 2 ],
        foffset: 3
      });
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
