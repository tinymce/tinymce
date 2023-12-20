import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableRowClassListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const tableHtml = '<table>\n<tbody>\n<tr>\n<td>x</td>\n</tr>\n</tbody>\n</table>';

  afterEach(() => {
    const editor = hook.editor();
    editor.options.unset('table_row_class_list');
  });

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
    editor.options.set('table_row_class_list', [{ title: 'test', value: 'test' }]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowProps');
    await TableTestUtils.pAssertListBoxValue('Select class', editor, 'Class', 'mce-no-match');
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, tableHtml);
  });

  it('TINY-6653: Selecting a row class that has no value should remove a previously applied class', async () => {
    const editor = hook.editor();
    editor.options.set('table_row_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableRowProps', 'test');
    TinyAssertions.assertContentPresence(editor, { 'tr[class="test"]': 1 });

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableRowProps', 'none');
    TinyAssertions.assertContent(editor, tableHtml);
  });

  it('TINY-6653: Selecting "none" will remove all classes from a row that has an unrelated class', async () => {
    const editor = hook.editor();
    editor.options.set('table_row_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    editor.setContent('<table><tbody><tr class="something"><td>x</td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableRowProps', 'none');
    TinyAssertions.assertContent(editor, tableHtml);
  });

  it('TINY-6653: Selecting "Select..." will do nothing', async () => {
    const editor = hook.editor();
    editor.options.set('table_row_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    const content = '<table>\n<tbody>\n<tr class="something">\n<td>x</td>\n</tr>\n</tbody>\n</table>';
    editor.setContent(content);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableRowProps', 'Select...');
    TinyAssertions.assertContent(editor, content);
  });
});
