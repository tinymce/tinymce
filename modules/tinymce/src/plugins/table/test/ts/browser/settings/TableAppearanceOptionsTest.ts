import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableAppearanceTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  it('TBA: test that settings for appearance can be disabled', async () => {
    const editor = hook.editor();
    editor.options.set('table_appearance_options', false);
    editor.setContent(tableHtml);
    TinySelections.select(editor, 'table td', [ 0 ]);
    editor.execCommand('mceTableProps');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Assertions.assertPresence(
      'assert presence of spacing, padding, border and caption inputs',
      {
        'label:contains("Cell spacing")': 0,
        'label:contains("Cell padding")': 0,
        'label:contains("Border") + input': 0,
        'label:contains("Caption")': 0
      },
      dialog
    );
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TBA: test that settings for appearance can be enabled', async () => {
    const editor = hook.editor();
    editor.options.set('table_appearance_options', true);
    editor.setContent(tableHtml);
    TinySelections.select(editor, 'table td', [ 0 ]);
    editor.execCommand('mceTableProps');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Assertions.assertPresence(
      'assert presence of spacing, padding, border and caption inputs',
      {
        'label:contains("Cell spacing")': 1,
        'label:contains("Cell padding")': 1,
        'label:contains("Border") + input': 1,
        'label:contains("Caption")': 1
      },
      dialog
    );
    await TableTestUtils.pClickDialogButton(editor, false);
  });
});
