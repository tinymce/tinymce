/* eslint-disable no-console */
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AutoResizePlugin from 'tinymce/plugins/autoresize/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import { pOpenContextMenu, sanitizeString } from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableCellPropsStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table autoresize',
    indent: false,
    contextmenu: 'inserttable',
    base_url: '/project/tinymce/js/tinymce',
  }, [ AutoResizePlugin, TablePlugin ], true);

  const assertNoConsoleWarn = async (editor: Editor) => {
    const warns: string[] = [];
    const originalWarn = console.warn;
    const expectedWarn = 'The component must be in a context to execute: triggerEvent <div class="tox-insert-table-picker"></div> is not in context.';

    console.warn = (arg: string) => warns.push(arg);

    // Perform UI actions that may generate warnings
    TinyUiActions.clickOnUi(editor, 'div[aria-label="2 columns, 2 rows"]');
    await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog');

    console.warn = originalWarn;

    const lastWarn = Arr.last(warns).getOr('none');

    const warnSanitized = sanitizeString(lastWarn);
    const expectedSanitized = sanitizeString(expectedWarn);

    assert.notEqual(warnSanitized, expectedSanitized, `Warning matched expected: ${expectedSanitized}`);
  };

  it('TINY-6887: should have no console warning when inserting table via context menu', async () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    await pOpenContextMenu(editor, 'p');
    await TinyUiActions.pWaitForPopup(editor, '.tox-collection--list');
    TinyUiActions.clickOnUi(editor, 'div[role="menuitem"]:contains("Table")');
    await assertNoConsoleWarn(editor);
  });
});
