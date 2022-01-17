import { ApproxStructure, Assertions, FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
    await Waiter.pWait(0);
  };

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pCloseDialogAndWait = async (editor: Editor) => {
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.closeDialog(editor);
    await Waiter.pTryUntil(
      'Wait for dialog to close',
      () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]')
    );
  };

  const pressDownArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());
  const pressEnterKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.enter());

  const repeatDownArrowKey = (editor: Editor, index: number) =>
    Arr.range(index, () => pressDownArrowKey(editor));

  // 'index' points to the context menuitems while 'subindex' points to the sub menuitems
  const pSelectContextMenu = async (label: string, editor: Editor, selector: string, index: number, subindex: number) => {
    await pOpenContextMenu(editor, 'td');
    repeatDownArrowKey(editor, subindex);
    TinyUiActions.keydown(editor, Keys.right());
    repeatDownArrowKey(editor, index);
    await pAssertFocusOnItem(label, selector);
    pressEnterKey(editor);
  };

  const pSelectCellContextMenu = (label: string, editor: Editor, selector: string, index: number) =>
    pSelectContextMenu(label, editor, selector, index, 0);

  const pSelectRowContextMenu = (label: string, editor: Editor, selector: string, index: number) =>
    pSelectContextMenu(label, editor, selector, index, 1);

  const pSelectColumnContextMenu = (label: string, editor: Editor, selector: string, index: number) =>
    pSelectContextMenu(label, editor, selector, index, 2);

  const tableHtml = '<table style="width: 100%;">' +
    '<tbody>' +
      '<tr>' +
        '<td></td>' +
        '<td></td>' +
      '</tr>' +
      '<tr>' +
        '<td></td>' +
        '<td></td>' +
      '</tr>' +
    '</tbody>' +
  '</table>';

  const tableWithCaptionHtml = '<table style="width: 100%;">' +
    '<caption>Caption</caption>' +
    '<tbody>' +
      '<tr>' +
        '<td></td>' +
        '<td></td>' +
      '</tr>' +
    '</tbody>' +
  '</table>';

  // Using a different table to test merge cells as selection using keydown (shift + arrow keys) does not work on Edge for some reason.
  // TODO: Investigate why selection does not work on Edge.
  const mergeTableHtml = '<table style="width: 100%;">' +
    '<tbody>' +
      '<tr>' +
        '<td data-mce-selected="1" data-mce-first-selected="1">a1</td>' +
        '<td>a2</td>' +
      '</tr>' +
      '<tr>' +
        '<td data-mce-selected="1" data-mce-last-selected="1">b1</td>' +
        '<td>b2</td>' +
      '</tr>' +
    '</tbody>' +
  '</table>';

  const assertHtmlStructure = (label: string, editor: Editor, expectedHtml: string) =>
    Assertions.assertStructure(label, ApproxStructure.build((s) => s.element('body', {
      children: [
        ApproxStructure.fromHtml(expectedHtml),
        s.theRest()
      ]
    })), TinyDom.body(editor));

  it('TBA: Test context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pOpenContextMenu(editor, 'td');
    await pAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
    TinyUiActions.keydown(editor, Keys.up());
    pressEnterKey(editor);
    await pCloseDialogAndWait(editor);
  });

  it('TBA: Test caption context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableWithCaptionHtml);
    await pOpenContextMenu(editor, 'caption');
    await pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
    TinyUiActions.keydown(editor, Keys.up());
    pressEnterKey(editor);
    await pCloseDialogAndWait(editor);
  });

  it('TBA: Test cell context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pOpenContextMenu(editor, 'td');
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Merge Cells', '.tox-collection__item:contains("Merge cells")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Split Cell', '.tox-collection__item:contains("Split cell")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")');
    pressEnterKey(editor);
    await pCloseDialogAndWait(editor);
  });

  it('TBA: Test merge cells and split cell context menu options on a table', async () => {
    const editor = hook.editor();
    editor.setContent(mergeTableHtml);
    await pSelectCellContextMenu('Merge Cells', editor, '.tox-collection__item:contains("Merge cells")', 1);
    assertHtmlStructure('Assert Merge Cells', editor, '<table><tbody><tr><td>a1<br />b1<br /></td><td>a2</td></tr><tr><td>b2</td></tr></tbody></table>');

    await pSelectCellContextMenu('Split Cell', editor, '.tox-collection__item:contains("Split cell")', 2);
    assertHtmlStructure('Assert Split Cell', editor, '<table><tbody><tr><td>a1<br />b1<br /></td><td>a2</td></tr><tr><td><br /></td><td>b2</td></tr></tbody></table>');
  });

  it('TBA: Test row context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pSelectRowContextMenu('Insert Row Before', editor, '.tox-collection__item:contains("Insert row before")', 0);
    assertHtmlStructure('Assert Insert Row', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectRowContextMenu('Insert Row After', editor, '.tox-collection__item:contains("Insert row after")', 1);
    assertHtmlStructure('Assert Insert Row', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectRowContextMenu('Delete Row', editor, '.tox-collection__item:contains("Delete row")', 2);
    assertHtmlStructure('Assert Row Deleted', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectRowContextMenu('Row Properties', editor, '.tox-collection__item:contains("Row properties")', 3);
    await pCloseDialogAndWait(editor);

    await pSelectRowContextMenu('Cut Row', editor, '.tox-collection__item:contains("Cut row")', 4);
    assertHtmlStructure('Assert Row Deleted', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectRowContextMenu('Copy Row', editor, '.tox-collection__item:contains("Copy row")', 5);

    await pSelectRowContextMenu('Paste Row Before', editor, '.tox-collection__item:contains("Paste row before")', 6);
    assertHtmlStructure('Assert Paste Row', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectRowContextMenu('Paste Row After', editor, '.tox-collection__item:contains("Paste row after")', 7);
    assertHtmlStructure('Assert Paste Row', editor, '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>');
  });

  it('TBA: Test delete table context menu', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pOpenContextMenu(editor, 'td');
    repeatDownArrowKey(editor, 4);
    pressEnterKey(editor);
    assertHtmlStructure('Assert table is deleted', editor, '<p><br></p>');
  });

  it('TBA: Test column context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pSelectColumnContextMenu('Insert Column Before', editor, '.tox-collection__item:contains("Insert column before")', 0);
    assertHtmlStructure('Assert Insert Column', editor, '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectColumnContextMenu('Insert Column After', editor, '.tox-collection__item:contains("Insert column after")', 1);
    assertHtmlStructure('Assert Insert Column', editor, '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr></tbody></table>');

    await pSelectColumnContextMenu('Delete Column', editor, '.tox-collection__item:contains("Delete column")', 2);
    assertHtmlStructure('Assert Column Deleted', editor, '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>');
  });
});
