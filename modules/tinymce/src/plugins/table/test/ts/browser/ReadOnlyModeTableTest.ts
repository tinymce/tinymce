import { Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, SelectorExists, SelectorFind, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import TablePlugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.core.ReadOnlyModeTableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table',
    statusbar: false,
    indent: false,
  }, [ TablePlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const tableHtml = `<table style="width: 100%;">
    <tbody>
      <tr>
        <td>1</td>
        <td>2</td>
      </tr>
      <tr>
        <td>3</td>
        <td>4</td>
      </tr>
    </tbody>
    </table>`;

  const pAssertResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to show', () => assert.isTrue(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init'));
  };

  const pAssertNoResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to not show', () => assert.isFalse(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init'));
  };

  const assertResizeBars = (editor: Editor, expectedState: boolean) => {
    SelectorFind.descendant(Traverse.documentElement(TinyDom.document(editor)), '.ephox-snooker-resizer-bar').fold(
      () => {
        assert.isFalse(expectedState, 'Was expecting to find resize bars');
      },
      (bar) => {
        const actualDisplay = Css.get(bar, 'display');
        const expectedDisplay = expectedState ? 'block' : 'none';
        assert.equal(actualDisplay, expectedDisplay, 'Should be expected display state on resize bar');
      }
    );
  };

  const mouseOverTable = (editor: Editor) => {
    const table = UiFinder.findIn(TinyDom.body(editor), 'table').getOrDie();
    Mouse.mouseOver(table);
  };

  it('TINY-10981: Table resize should not be shown in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
    await pAssertResizeHandle(editor);

    setMode(editor, 'readonly');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
    await pAssertNoResizeHandle(editor);

    setMode(editor, 'design');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
    await pAssertResizeHandle(editor);
  });

  it('TINY-10981: Resize bars for tables should be hidden while in readonly mode', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    mouseOverTable(editor);
    assertResizeBars(editor, false);
    mouseOverTable(editor);
    assertResizeBars(editor, false);

    setMode(editor, 'design');
    mouseOverTable(editor);
    assertResizeBars(editor, true);
  });

  it('TINY-10981: Deleting table content should not be permitted in readonly mode', async () => {
    const editor = hook.editor();
    setMode(editor, 'design');
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
    editor.execCommand('Delete');

    const expectedContent = [
      '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>&nbsp;</td>',
      '<td>2</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>'
    ].join('');
    TinyAssertions.assertContent(editor, expectedContent);

    setMode(editor, 'readonly');
    TinySelections.setSelection(editor, [ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 1);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, expectedContent);

    setMode(editor, 'design');
    TinySelections.setSelection(editor, [ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 1);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, [ '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>&nbsp;</td>',
      '<td>&nbsp;</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>' ].join(''));
  });

  it('TINY-10981: Deleting table element should not be permitted in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(tableHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'table', []);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, [ '<table style="width: 100%;">',
      '<tbody>',
      '<tr>',
      '<td>1</td>',
      '<td>2</td>',
      '</tr>',
      '<tr>',
      '<td>3</td>',
      '<td>4</td>',
      '</tr>',
      '</tbody>',
      '</table>' ].join(''));

    setMode(editor, 'design');
    TinySelections.select(editor, 'table', []);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Pressing tab at the last cell should not create new row', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr></tbody></table>');

    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');

    setMode(editor, 'design');
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></tbody></table>');
  });
});
