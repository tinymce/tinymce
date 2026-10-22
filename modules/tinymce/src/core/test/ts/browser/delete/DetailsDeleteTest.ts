import type { Cursors } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional, Optionals } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
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
    it('Delete forward in first empty block before details should remove the block and move caret to summary', () => testDeleteForward({
      html: '<p>&nbsp;</p><details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>',
      selection: caret([ 0 ], 0),
      expectedSelection: caret([ 0, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<details open=""><summary>s1</summary><div><p>&nbsp;</p></div></details>'
    }));

    it('Delete backward in last empty block after details should remove the block and move caret to end of body', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><p>body</p></div></details><p>&nbsp;</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: '<details open=""><summary>s1</summary><div><p>body</p></div></details>'
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
    it('TINY-9965: Delete forward in first empty block before nested details should remove the block and move caret to nested summary', () => testDeleteForward({
      html: '<details open=""><summary>s1</summary><div><p>&nbsp;</p><details open=""><summary>s2</summary><div>body</div></details></div></details>',
      selection: caret([ 0, 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<details open=""><summary>s1</summary><div><details open=""><summary>s2</summary><div>body</div></details></div></details>'
    }));

    it('TINY-9965: Delete backward in last empty block after nested details should remove the block and move caret to end of nested body', () => testDeleteBackward({
      html: '<details open=""><summary>s1</summary><div><details open=""><summary>s2</summary><div>body</div></details><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 1, 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 1, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: '<details open=""><summary>s1</summary><div><details open=""><summary>s2</summary><div>body</div></details></div></details>'
    }));
  });

  context('TINYMCE-9955: Empty block wrapped in a container next to details', () => {
    const details = '<details open=""><summary>s1</summary><div><p>body</p></div></details>';

    it('TINYMCE-9955: Delete forward in empty block wrapped in a div before details should remove the wrapper', () => testDeleteForward({
      html: '<div><p>&nbsp;</p></div>' + details,
      selection: caret([ 0, 0 ], 0),
      expectedSelection: caret([ 0, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: details
    }));

    it('TINYMCE-9955: Delete forward in empty list item before details should remove the list', () => {
      testDeleteForward({
        html: '<ul><li>&nbsp;</li></ul>' + details,
        selection: caret([ 0, 0 ], 0),
        expectedSelection: caret([ 0, 0, 0 ], 0),
        expectedPrevented: true,
        expectedHtml: details
      });
      // The serializer drops an empty list, so also check the live DOM
      TinyAssertions.assertContentPresence(hook.editor(), { ul: 0 });
    });

    it('TINYMCE-9955: Delete forward in deeply nested empty block before details should remove the outermost empty ancestor', () => testDeleteForward({
      html: '<blockquote><div><p>&nbsp;</p></div></blockquote>' + details,
      selection: caret([ 0, 0, 0 ], 0),
      expectedSelection: caret([ 0, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: details
    }));

    it('TINYMCE-9955: Delete backward in empty block wrapped in a div after details should remove the wrapper', () => testDeleteBackward({
      html: details + '<div><p>&nbsp;</p></div>',
      selection: caret([ 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: details
    }));

    it('TINYMCE-9955: Delete backward in empty list item after details should remove the list', () => {
      testDeleteBackward({
        html: details + '<ul><li>&nbsp;</li></ul>',
        selection: caret([ 1, 0 ], 0),
        expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
        expectedPrevented: true,
        expectedHtml: details
      });
      // The serializer drops an empty list, so also check the live DOM
      TinyAssertions.assertContentPresence(hook.editor(), { ul: 0 });
    });

    it('TINYMCE-9955: Delete backward in deeply nested empty block after details should remove the outermost empty ancestor', () => testDeleteBackward({
      html: details + '<blockquote><div><p>&nbsp;</p></div></blockquote>',
      selection: caret([ 1, 0, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: details
    }));

    it('TINYMCE-9955: Delete forward in empty block in a wrapper with other content before details should only remove the empty block', () => testDeleteForward({
      html: '<div><p>abc</p><p>&nbsp;</p></div>' + details,
      selection: caret([ 0, 1 ], 0),
      expectedSelection: caret([ 1, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<div><p>abc</p></div>' + details
    }));

    it('TINYMCE-9955: Delete backward in empty block in a wrapper with other content after details should only remove the empty block', () => testDeleteBackward({
      html: details + '<div><p>&nbsp;</p><p>abc</p></div>',
      selection: caret([ 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: details + '<div><p>abc</p></div>'
    }));

    it('TINYMCE-9955: Delete forward in empty last list item before details should only remove the list item', () => testDeleteForward({
      html: '<ul><li>a</li><li>&nbsp;</li></ul>' + details,
      selection: caret([ 0, 1 ], 0),
      expectedSelection: caret([ 1, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: '<ul><li>a</li></ul>' + details
    }));

    it('TINYMCE-9955: Delete backward in empty first list item after details should only remove the list item', () => testDeleteBackward({
      html: details + '<ul><li>&nbsp;</li><li>a</li></ul>',
      selection: caret([ 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: details + '<ul><li>a</li></ul>'
    }));
  });

  context('TINYMCE-9955: Details inside or next to tables', () => {
    const details = '<details open=""><summary>s1</summary><div><p>body</p></div></details>';
    const table = (cellHtml: string) => `<table><tbody><tr><td>${cellHtml}</td></tr></tbody></table>`;

    const testDeleteKeepsTable = (forward: boolean, html: string, selection: Cursors.CursorPath) => {
      const editor = hook.editor();
      editor.setContent(html);
      TinySelections.setSelection(editor, selection.startPath, selection.soffset, selection.finishPath, selection.foffset);
      DetailsDelete.backspaceDelete(editor, forward, 'character').each((action) => action());
      TinyAssertions.assertContent(editor, html);
      TinyAssertions.assertContentPresence(editor, { table: 1, td: 1 });
      TinyAssertions.assertSelection(editor, selection.startPath, selection.soffset, selection.finishPath, selection.foffset);
    };

    it('TINYMCE-9955: Delete forward in empty block before details inside a table cell should remove the block and keep the cell', () => testDeleteForward({
      html: table('<p>&nbsp;</p>' + details),
      selection: caret([ 0, 0, 0, 0, 0 ], 0),
      expectedSelection: caret([ 0, 0, 0, 0, 0, 0, 0 ], 0),
      expectedPrevented: true,
      expectedHtml: table(details)
    }));

    it('TINYMCE-9955: Delete backward in empty block after details inside a table cell should remove the block and keep the cell', () => testDeleteBackward({
      html: table(details + '<p>&nbsp;</p>'),
      selection: caret([ 0, 0, 0, 0, 1 ], 0),
      expectedSelection: caret([ 0, 0, 0, 0, 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true,
      expectedHtml: table(details)
    }));

    it('TINYMCE-9955: Delete forward in empty wrapped block in a table cell before details should not delete out of the cell', () =>
      testDeleteKeepsTable(true, table('<div><p>&nbsp;</p></div>') + details, caret([ 0, 0, 0, 0, 0, 0 ], 0))
    );

    it('TINYMCE-9955: Delete backward in empty wrapped block in a table cell after details should not delete out of the cell', () =>
      testDeleteKeepsTable(false, details + table('<div><p>&nbsp;</p></div>'), caret([ 1, 0, 0, 0, 0, 0 ], 0))
    );
  });
});

