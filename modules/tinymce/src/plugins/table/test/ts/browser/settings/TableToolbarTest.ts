import { UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.TableToolbarTest', () => {
  before(() => {
    Plugin();
    Theme();
  });

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';
  const tableWithCaptionHtml = '<table><caption>Caption</caption><tbody><tr><td>x</td></tr></tbody></table>';
  const tableWithAdditionalHtml = '<p>A</p><table><tbody><tr><td>B</td></tr></tbody></table><p>C</p>';

  const pCreateEditor = (toolbar: string) => McEditor.pFromSettings<Editor>({
    plugins: 'table',
    toolbar: 'tablecaption',
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

  context('Ensure table buttons are enabled when appropriate', () => {
    it('TINY-7737: When the whole selection is in the table', async () => {
      const editor = await pCreateEditor('tablecaption');
      editor.focus();
      editor.setContent(tableWithAdditionalHtml);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      TinySelections.setSelection(editor, [ 1, 0, 0, 0 ], 0, [ 1, 0, 0, 0 ], 1);
      // Wait for a while to allow the toolbar a chance to render
      await Waiter.pWait(100);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn[title="Table caption"]');
      UiFinder.notExists(SugarBody.body(), '.tox-tbtn--disabled[title="Table caption"]');
      McEditor.remove(editor);
    });

    it('TINY-7737: When the selection starts outside the table, but ends in the table', async () => {
      const editor = await pCreateEditor('tablecaption');
      editor.focus();
      editor.setContent(tableWithAdditionalHtml);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      TinySelections.setSelection(editor, [ 1, 0, 0, 0 ], 0, [ 2 ], 1);
      // Wait for a while to allow the toolbar a chance to render
      await Waiter.pWait(100);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      McEditor.remove(editor);
    });

    it('TINY-7737: When the selection starts inside the table, but ends outside the table', async () => {
      const editor = await pCreateEditor('tablecaption');
      editor.focus();
      editor.setContent(tableWithAdditionalHtml);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 1, 0, 0, 0 ], 1);
      // Wait for a while to allow the toolbar a chance to render
      await Waiter.pWait(100);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      McEditor.remove(editor);
    });

    it('TINY-7737: When the selection starts and ends outside of the table', async () => {
      const editor = await pCreateEditor('tablecaption');
      editor.focus();
      editor.setContent(tableWithAdditionalHtml);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 2 ], 1);
      // Wait for a while to allow the toolbar a chance to render
      await Waiter.pWait(100);
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
      McEditor.remove(editor);
    });
  });
});
