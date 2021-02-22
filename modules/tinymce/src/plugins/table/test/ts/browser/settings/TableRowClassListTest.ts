import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableRowClassListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  it('TBA: no class input without setting', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowProps');
    await TableTestUtils.pAssertDialogPresence(
      'Checking that class label is not present',
      editor,
      {
        'label:contains("Class")': 0
      }
    );
    await TableTestUtils.pClickDialogButton(editor, false);
  });

  it('TBA: class input with setting', async () => {
    const editor = hook.editor();
    editor.settings.table_row_class_list = [{ title: 'test', value: 'test' }];
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowProps');
    await TableTestUtils.pAssertListBoxValue('Select class', editor, 'Class', 'test');
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContentPresence(editor, { 'tr.test': 1 });
  });
});
