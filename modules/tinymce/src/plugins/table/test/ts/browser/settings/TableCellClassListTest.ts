import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableCellClassListTest', () => {
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
    editor.execCommand('mceTableCellProps');
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
    editor.options.set('table_cell_class_list', [{ title: 'test', value: 'test' }]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableCellProps');
    await TableTestUtils.pAssertListBoxValue('Select class', editor, 'Class', 'mce-no-match');
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, tableHtml);
  });

  it('TINY-6653: Selecting a cell class that has no value should remove a previously applied class', async () => {
    const editor = hook.editor();
    editor.options.set('table_cell_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    editor.setContent(tableHtml);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableCellProps', 'test');
    TinyAssertions.assertContentPresence(editor, { 'td[class="test"]': 1 });

    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableCellProps', 'none');
    TinyAssertions.assertContentPresence(editor, { 'td[class]': 0, 'td': 1 });
  });

  it('TINY-6653: Selecting the "none" selection will remove all classes from a cell that has an unrelated class', async () => {
    const editor = hook.editor();
    editor.options.set('table_cell_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    editor.setContent('<table><tbody><tr><td class="something">x</td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableCellProps', 'none');
    TinyAssertions.assertContentPresence(editor, { 'td[class]': 0, 'td': 1 });
  });

  it('TINY-6653: Selecting "Select..." will do nothing', async () => {
    const editor = hook.editor();
    editor.options.set('table_cell_class_list', [
      { title: 'none', value: '' },
      { title: 'test', value: 'test' }
    ]);
    const content = '<table>\n<tbody>\n<tr>\n<td class="something">x</td>\n</tr>\n</tbody>\n</table>';
    editor.setContent(content);
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    await TableTestUtils.selectClassViaPropsDialog(editor, 'mceTableCellProps', 'Select...');
    TinyAssertions.assertContent(editor, content);
  });
});
