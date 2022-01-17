import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableCellPropsStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: change background color on selected table cells', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<tbody>' +
      '<tr><td style="background-color: blue;" data-mce-selected="1">a</td><td style="background-color: blue;" data-mce-selected="1">b</td></tr>' +
      '</tbody>' +
      '</table>'
    );
    TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableCellProps');
    TableTestUtils.gotoAdvancedTab();
    TableTestUtils.setInputValue('label.tox-label:contains(Background color) + div>input.tox-textfield', 'red');
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor,
      '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="background-color: red;">a</td><td style="background-color: red;">b</td></tr></tbody></table>'
    );
  });
});
