import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ToolbarButtonDisplayTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    toolbar: 'tablecaption',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const editorContent = '<p>A</p><table><tbody><tr><td>B</td></tr></tbody></table><p>C</p>';

  const displayTest = async (startPath: number[], startOffset: number, endPath: number[], endOffset: number, shouldBeEnabled: boolean) => {
    const editor = hook.editor();
    editor.setContent(editorContent);
    await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
    TinySelections.setSelection(editor, startPath, startOffset, endPath, endOffset);

    if (shouldBeEnabled) {
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn[title="Table caption"]');
      UiFinder.notExists(SugarBody.body(), '.tox-tbtn--disabled[title="Table caption"]');
    } else {
      await TinyUiActions.pWaitForUi(editor, '.tox-tbtn--disabled[title="Table caption"]');
    }
  };

  context('Ensure table buttons are enabled when appropriate', () => {
    it('TINY-7737: When the whole selection is in the table', async () => {
      await displayTest([ 1, 0, 0, 0 ], 0, [ 1, 0, 0, 0 ], 1, true);
    });

    it('TINY-7737: When the selection starts outside the table, but ends in the table', async () => {
      await displayTest([ 1, 0, 0, 0 ], 0, [ 2 ], 1, false);
    });

    it('TINY-7737: When the selection starts inside the table, but ends outside the table', async () => {
      await displayTest([ 0 ], 0, [ 1, 0, 0, 0 ], 1, false);
    });

    it('TINY-7737: When the selection starts and ends outside of the table', async () => {
      await displayTest([ 0 ], 0, [ 2 ], 1, false);
    });
  });
});
