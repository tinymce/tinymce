import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Obj, Optional } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

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
    tablecaption: 'Table caption',
    tablerowheader: 'Row header',
    tablecolheader: 'Column header'
  };
  const menuButtonTableButtons = {
    table: 'Table',
    tablecellvalign: 'Vertical align',
    tablecellborderwidth: 'Border width',
    tablecellborderstyle: 'Border style',
    tablecellbackgroundcolor: 'Background color',
    tablecellbordercolor: 'Border color'
  };
  const specialTableButtons = {
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
    inserttabledialog: 'Insert table',
    tablecellvalign: 'Vertical align',
    tablecellborderwidth: 'Border width',
    tablecellborderstyle: 'Border style',
    tablecellbackgroundcolor: 'Background color',
    tablecellbordercolor: 'Border color'
  };
  const specialTableMenuItems = {
    inserttable: 'Table',
    tablemergecells: 'Merge cells',
    tablesplitcells: 'Split cell',
    tablepasterowbefore: 'Paste row before',
    tablepasterowafter: 'Paste row after',
    tablepastecolumnbefore: 'Paste column before',
    tablepastecolumnafter: 'Paste column after'
  };
  const tableButtons = { ...simpleTableButtons, ...menuButtonTableButtons, ...specialTableButtons };
  const tableMenuItems = { ...simpleTableMenuItems, ...specialTableMenuItems };
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar: Obj.keys(tableButtons).join(' '),
    menu: {
      table: { title: 'Table', items: Obj.keys(tableMenuItems).join(' ') }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  context('Noneditable root buttons', () => {
    const testDisableButtonOnNoneditable = (title: string, ariaDisabled = true) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const disabledSelector = ariaDisabled ? '[aria-disabled="true"]' : ':disabled';
        const enabledSelector = ariaDisabled ? '[aria-disabled="false"]' : ':not(:disabled)';
        editor.setContent(
          '<div><table><tbody><tr><td>Noneditable content</td></tr></tbody></table></div>' +
          '<div contenteditable="true"><table><tbody><tr><td>Editable content</td></tr></tbody></table></div>'
        );
        TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"]${disabledSelector}`);
        TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"]${enabledSelector}`);
      });
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

    Obj.each(menuButtonTableButtons, (title, key) => {
      it(`TINY-9669: Disable ${key} button on noneditable content`, () => testDisableButtonOnNoneditable(title, false));
    });

    it(`TINY-9669: Disable tablepastecolbefore on noneditable content`, testDisableColPasteButtonOnNoneditable('Paste column before'));
    it(`TINY-9669: Disable tablepastecolafter on noneditable content`, testDisableColPasteButtonOnNoneditable('Paste column after'));
    it(`TINY-9669: Disable tablepasterowbefore on noneditable content`, testDisableRowPasteButtonOnNoneditable('Paste row before'));
    it(`TINY-9669: Disable tablepasterowafter on noneditable content`, testDisableRowPasteButtonOnNoneditable('Paste row after'));

    it('TINY-9669: Disable tablesplitcells on noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const title = 'Split cell';
        const table = '<table><tbody><tr><td colspan="2">A</td></tr><tr><td>A</td><td>B</td></tr></tbody></table></div>';
        editor.setContent(`<div>${table}</div><div contenteditable="true">${table}</div>`);
        TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0, 0 ], 1);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      });
    });
  });

  context('Noneditable root menuitems', () => {
    const testDisableMenuitemOnNoneditable = (menuitem: string) => async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
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
      });
    };

    const testDisableColPasteMenuItemOnNoneditable = (title: string) => {
      return async () => {
        FakeClipboard.setColumns(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        await testDisableMenuitemOnNoneditable(title)();
      };
    };

    const testDisableRowPasteMenuItemOnNoneditable = (title: string) => {
      return async () => {
        FakeClipboard.setRows(Optional.some([ TableTestUtils.createRow([ 'a' ]) ]));
        await testDisableMenuitemOnNoneditable(title)();
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
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
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
      });
    });
  });
});

