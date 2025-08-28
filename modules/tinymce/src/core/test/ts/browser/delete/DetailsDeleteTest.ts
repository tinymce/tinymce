import { Cursors } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional, Optionals } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as DetailsDelete from 'tinymce/core/delete/DetailsDelete';

interface TestCase {
  readonly html: string;
  readonly selection: Cursors.CursorPath;
  readonly expectedSelection: Cursors.CursorPath;
  readonly expectedPrevented: boolean;
  readonly expectedHtml?: string;
}

describe('browser.tinymce.core.delete.DeleteDetailsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const caret = (path: number[], offset: number): Cursors.CursorPath => ({ startPath: path, soffset: offset, finishPath: path, foffset: offset });

  const testDeleteDetails = (forward: boolean) => (testCase: TestCase) => {
    const editor = hook.editor();
    const expectedHtml = testCase.expectedHtml ?? testCase.html;

    editor.setContent(testCase.html);
    TinySelections.setSelection(editor, testCase.selection.startPath, testCase.selection.soffset, testCase.selection.finishPath, testCase.selection.foffset);
    const prevented = Optionals.equals(DetailsDelete.backspaceDelete(editor, forward, 'character'), Optional.some(Fun.noop));
    assert.equal(prevented, testCase.expectedPrevented);
    TinyAssertions.assertContent(editor, expectedHtml);
    TinyAssertions.assertSelection(editor, testCase.expectedSelection.startPath, testCase.expectedSelection.soffset, testCase.expectedSelection.finishPath, testCase.expectedSelection.foffset);
  };

  const testDeleteForward = testDeleteDetails(true);
  const testDeleteBackward = testDeleteDetails(false);

  const isSafari = PlatformDetection.detect().browser.isSafari();

  context('Summary', () => {
    it('Delete forward at the end of summary should do nothing', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 0, 0 ], 2),
      expectedSelection: caret([ 0, 0, 0 ], 2),
      expectedPrevented: true
    }));

    it('Delete backward at the start of summary should do nothing', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 0, 0 ], 0),
      expectedSelection: caret([ 0, 0, 0 ], 0),
      expectedPrevented: true
    }));

    it('Delete forward in middle of summary should be prevented on Safari', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 0, 0 ], 1),
      expectedSelection: caret([ 0, 0, 0 ], 1),
      // TINY-9951: Safari override for accordion summary
      expectedPrevented: isSafari ? true : false,
      expectedHtml: `<details open=""><summary>s${isSafari ? '' : '1'}</summary><div><p>&nbsp;</p></div></details>`
    }));

    it('TINY-10123: Delete backward in middle of summary should prevented on Safari', () => {
      testDeleteBackward({
        html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
        selection: caret([ 0, 0, 0 ], 1),
        expectedSelection: caret([ 0, 0, 0 ], isSafari ? 0 : 1),
        expectedPrevented: isSafari ? true : false,
        expectedHtml: `<details open=""><summary>${isSafari ? '1' : 's1'}</summary><div><p>&nbsp;</p></div></details>`
      });
    });

    it('Delete backward in details body should not delete into summary', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0 ], 0),
      expectedPrevented: true
    }));
  });

  context('Into details', () => {
    it('Delete forward before details should do nothing', () => testDeleteForward({
      html: '<p>&nbsp;</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0 ], 0),
      expectedSelection: caret([ 0 ], 0),
      expectedPrevented: true
    }));

    it('Delete backward after details should move caret but not change the content', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><p>body</p></div></details><p>&nbsp;</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true
    }));

    it('Delete forward in last empty block after details should do nothing', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details><p>&nbsp;</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 1 ], 0),
      expectedPrevented: true
    }));

    it('Delete backward in first empty block before details should do nothing', () => testDeleteBackward({
      html: '<p>&nbsp;</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0 ], 0),
      expectedSelection: caret([ 0 ], 0),
      expectedPrevented: true
    }));

    it('Delete forward in empty block after details should do normal delete', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details><p>&nbsp;</p><p>abc</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 1 ], 0),
      expectedPrevented: false
    }));

    it('Delete backward in empty block before details should do nothing', () => testDeleteBackward({
      html: '<p>abc</p><p>&nbsp;</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 1 ], 0),
      expectedPrevented: false
    }));

    it('Delete forward in empty block before details that is not the first one should delete the empty block', () => testDeleteForward({
      html: '<p>abc</p><p>&nbsp;</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 1, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<p>abc</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>'
    }));

    it('Delete backward in empty block after details that is not the last one should delete the empty block', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details><p>&nbsp;</p><p>abc</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 0, 1, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details><p>abc</p>'
    }));
  });

  context('Nested details', () => {
    it('TINY-9965: Delete forward before in first block before nested details should do nothing', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p><details open=""><summary>s2</summary><div>body</div></details></div></details>',
      selection: caret([ 0, 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0 ], 0),
      expectedPrevented: true
    }));

    it('TINY-9965: Delete backward in last block after nested details should just move caret', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><details open=""><summary>s2</summary><div>body</div></details><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 1, 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 1, 0 ], 'body'.length),
      expectedPrevented: true
    }));
  });
});

