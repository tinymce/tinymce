import { UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.TableToolbarTest', () => {
  before(() => {
    Plugin();
  });

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';
  const tableWithCaptionHtml = '<table><caption>Caption</caption><tbody><tr><td>x</td></tr></tbody></table>';

  const pCreateEditor = (toolbar: string) => McEditor.pFromSettings<Editor>({
    plugins: 'table',
    table_toolbar: toolbar,
    base_url: '/project/tinymce/js/tinymce'
  });

  it('TBA: test that table toolbar can be disabled', async () => {
    const editor = await pCreateEditor('');
    editor.focus();
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    // Wait for a while to allow the toolbar a chance to render
    await Waiter.pWait(100);
    UiFinder.notExists(SugarBody.body(), 'div.tox-pop div.tox-toolbar');
    McEditor.remove(editor);
  });

  it('TINY-6006: test toolbar icons disabled based on selection or state', async () => {
    const editor = await pCreateEditor('tablecopyrow tablepasterowafter tablepasterowbefore');
    editor.focus();
    editor.setContent(tableWithCaptionHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    // Ensure the copy/paste row buttons are disabled
    await TinyUiActions.pWaitForUi(editor, '.tox-pop .tox-tbtn--disabled[title="Copy row"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-pop .tox-tbtn--disabled[title="Paste row before"]');
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
    // Ensure the copy row button is enabled, but the paste row button is disabled
    await TinyUiActions.pWaitForUi(editor, '.tox-pop .tox-tbtn[title="Copy row"]:not(.tox-tbtn--disabled)');
    await TinyUiActions.pWaitForUi(editor, '.tox-pop .tox-tbtn--disabled[title="Paste row before"]');
    editor.execCommand('mceTableCopyRow');
    // The paste row button should now be enabled
    await TinyUiActions.pWaitForUi(editor, '.tox-pop .tox-tbtn[title="Paste row before"]:not(.tox-tbtn--disabled)');
    McEditor.remove(editor);
  });
});
