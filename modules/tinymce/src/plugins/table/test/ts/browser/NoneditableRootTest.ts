import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Obj, Optional } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as FakeClipboard from 'tinymce/plugins/table/api/Clipboard';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.NoneditableRootTest', () => {
  const simpleTableContols = {
    tableprops: 'Table properties',
    tablecellprops: 'Cell properties',
    tableinsertrowbefore: 'Insert row before',
    tableinsertrowafter: 'Insert row after',
    tabledeleterow: 'Delete row',
    tablerowprops: 'Row properties',
    tablecutrow: 'Cut row',
    tablecopyrow: 'Copy row',
  };
  const specialTableButtons = {
    table: 'Table',
    tablemergecells: 'Merge cells',
    tablesplitcells: 'Split cell',
    tablepasterowbefore: 'Paste row before',
    tablepasterowafter: 'Paste row after',
    tablepastecolbefore: 'Paste column before',
    tablepastecolafter: 'Paste column after',
  };
  const simpleTableButtons = {
    ...simpleTableContols,
    tabledelete: 'Delete table',
    tabledeletecol: 'Delete column',
    tablecutcol: 'Cut column',
    tablecopycol: 'Copy column',
    tableinsertcolbefore: 'Insert column before',
    tableinsertcolafter: 'Insert column after',
    tableinsertdialog: 'Insert table'
  };
  const simpleTableMenuItems = {
    ...simpleTableContols,
    deletetable: 'Delete table',
    tabledeletecolumn: 'Delete column',
    tablecutcolumn: 'Cut column',
    tablecopycolumn: 'Copy column',
    tableinsertcolumnbefore: 'Insert column before',
    tableinsertcolumnafter: 'Insert column after',
    inserttabledialog: 'Insert table'
  };
  const specialTableMenuItems = {
    inserttable: 'Table',
    tablemergecells: 'Merge cells',
    tablesplitcells: 'Split cell',
    tablepasterowbefore: 'Paste row before',
    tablepasterowafter: 'Paste row after',
    tablepastecolumnbefore: 'Paste column before',
    tablepastecolumnafter: 'Paste column after',
  };
  const tableButtons = { ...simpleTableButtons, ...specialTableButtons };
  const tableMenuItems = { ...simpleTableMenuItems, ...specialTableMenuItems };
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar: Obj.keys(tableButtons).join(' '),
    menu: {
      table: { title: 'Table', items: Obj.keys(tableMenuItems).join(' ') }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const withNoneditableRootEditor = (editor: Editor, f: (editor: Editor) => void) => {
    editor.getBody().contentEditable = 'false';
    f(editor);
    editor.getBody().contentEditable = 'true';
  };

  context('Noneditable root buttons', () => {
    const testDisableButtonOnNoneditable = (title: string) => () => {
      const editor = hook.editor();
      editor.getBody().contentEditable = 'false';
      editor.setContent(
        '<div><table><tbody><tr><td>Noneditable content</td></tr></tbody></table></div>' +
        '<div contenteditable="true"><table><tbody><tr><td>Editable content</td></tr></tbody></table></div>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
      TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      editor.getBody().contentEditable = 'true';
    };

    const testDisableColPasteButtonOnNoneditable = (title: string) => {
      return () => {
        FakeClipboard.setColumns(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        testDisableButtonOnNoneditable(title)();
      };
    };

    const testDisableRowPasteButtonOnNoneditable = (title: string) => {
      return () => {
        FakeClipboard.setRows(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        testDisableButtonOnNoneditable(title)();
      };
    };

    Obj.each(simpleTableButtons, (title, key) => {
      it(`TINY-9669: Disable ${key} on noneditable content`, testDisableButtonOnNoneditable(title));
    });

    it('TINY-9669: Disable table button on noneditable content', () => {
      withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Table"]:disabled');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Table"]:not(:disabled)');
      });
    });

    it(`TINY-9669: Disable tablepastecolbefore on noneditable content`, testDisableColPasteButtonOnNoneditable('Paste column before'));
    it(`TINY-9669: Disable tablepastecolafter on noneditable content`, testDisableColPasteButtonOnNoneditable('Paste column after'));
    it(`TINY-9669: Disable tablepasterowbefore on noneditable content`, testDisableRowPasteButtonOnNoneditable('Paste row before'));
    it(`TINY-9669: Disable tablepasterowafter on noneditable content`, testDisableRowPasteButtonOnNoneditable('Paste row after'));

    it('TINY-9669: Disable tablesplitcells on noneditable content', () => {
      const editor = hook.editor();
      const title = 'Split cell';
      editor.getBody().contentEditable = 'false';
      const table = '<table><tbody><tr><td colspan="2">A</td></tr><tr><td>A</td><td>B</td></tr></tbody></table></div>';
      editor.setContent(`<div>${table}</div><div contenteditable="true">${table}</div>`);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
      UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
      TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 1);
      UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      editor.getBody().contentEditable = 'true';
    });
  });

  context('Noneditable root menuitems', () => {
    const testDisableMenuitemOnNoneditable = (menuitem: string) => async () => {
      const editor = hook.editor();
      editor.getBody().contentEditable = 'false';
      editor.setContent(
        '<div><table><tbody><tr><td>Noneditable content</td></tr></tbody></table></div>' +
        '<div contenteditable="true"><table><tbody><tr><td>Editable content</td></tr></tbody></table></div>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Table")');
      await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="${menuitem}"][aria-disabled="true"]`);
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Table")');
      await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="${menuitem}"][aria-disabled="false"]`);
      TinyUiActions.keystroke(editor, Keys.escape());
      editor.getBody().contentEditable = 'true';
    };

    const testDisableColPasteMenuItemOnNoneditable = (title: string) => {
      return () => {
        FakeClipboard.setColumns(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        testDisableMenuitemOnNoneditable(title)();
      };
    };

    const testDisableRowPasteMenuItemOnNoneditable = (title: string) => {
      return () => {
        FakeClipboard.setRows(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        testDisableMenuitemOnNoneditable(title)();
      };
    };

    Obj.each(simpleTableMenuItems, (title, key) => {
      it(`TINY-9669: Disable ${key} on noneditable content`, testDisableMenuitemOnNoneditable(title));
    });

    it(`TINY-9669: Disable tablepastecolumnbefore on noneditable content`, testDisableColPasteMenuItemOnNoneditable('Paste column before'));
    it(`TINY-9669: Disable tablepastecolumnafter on noneditable content`, testDisableColPasteMenuItemOnNoneditable('Paste column after'));
    it(`TINY-9669: Disable tablepasterowbefore on noneditable content`, testDisableRowPasteMenuItemOnNoneditable('Paste row before'));
    it(`TINY-9669: Disable tablepasterowafter on noneditable content`, testDisableRowPasteMenuItemOnNoneditable('Paste row after'));

    it('TINY-9669: Disable tablesplitcells on noneditable content', async () => {
      const editor = hook.editor();
      editor.getBody().contentEditable = 'false';
      const table = '<table><tbody><tr><td colspan="2">A</td></tr><tr><td>A</td><td>B</td></tr></tbody></table></div>';
      editor.setContent(`<div>${table}</div><div contenteditable="true">${table}</div>`);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Table")');
      await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="Split cell"][aria-disabled="true"]`);
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 1);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Table")');
      await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title="Split cell"][aria-disabled="false"]`);
      TinyUiActions.keystroke(editor, Keys.escape());
      editor.getBody().contentEditable = 'true';
    });
  });
});

