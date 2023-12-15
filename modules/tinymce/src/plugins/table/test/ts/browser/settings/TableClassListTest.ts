import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableClassListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  it('TBA: no class input without setting', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableProps');
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
    editor.options.set('table_class_list', [{ title: 'test', value: 'test' }]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    // FIX: Dupe with TableCellClassListTest.
    editor.execCommand('mceTableProps');
    await TableTestUtils.pAssertListBoxValue('Select class', editor, 'Class', 'test');
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContentPresence(editor, { 'table.test': 1 });
  });

  it('TINY-6653: Selecting a table class that has no value should remove a previously applied class', async () => {
    const editor = hook.editor();
    editor.options.set('table_class_list', [
      { title: 'none', value: '' }, // Empty value, as in no class should be applied.
      { title: 'test', value: 'test' }
    ]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableProps', 'test');
    TinyAssertions.assertContentPresence(editor, { 'table.test': 1 });

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableProps', 'none');
    TinyAssertions.assertContentPresence(editor, { 'table[class]': 0, 'table': 1 });
  });

  it('TINY-6653: Selecting "none" will remove all classes from a table that has an unrelated class', async () => {
    const editor = hook.editor();
    editor.options.set('table_class_list', [
      { title: 'none', value: '' }, // Empty value, as in no class should be applied.
      { title: 'test', value: 'test' }
    ]);
    editor.setContent('<table class="something"><tbody><tr><td>cell</td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableProps', 'none');
    TinyAssertions.assertContentPresence(editor, { 'table[class]': 0, 'table': 1 });
  });

  it('TINY-6653: Selecting "Unchanged" on a table with a class will do nothing', async () => {
    const editor = hook.editor();
    editor.options.set('table_class_list', [
      { title: 'none', value: '' }, // Empty value, as in no class should be applied.
      { title: 'test', value: 'test' }
    ]);
    editor.setContent('<table class="something"><tbody><tr><td>cell</td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableProps', 'Unchanged');
    TinyAssertions.assertContentPresence(editor, { 'table[class="something"]': 1 });
  });
});
