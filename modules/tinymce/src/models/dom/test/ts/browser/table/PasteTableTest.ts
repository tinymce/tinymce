import { Clipboard } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.PasteTableTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    table_merge_content_on_paste: false,
    base_url: '/project/tinymce/js/tinymce',
  }, []);
  const nestedTable = `<table style="border-collapse: collapse; width: 100.242%;" border="1"><colgroup> <col style="width: 49.9179%;"> <col style="width: 49.9179%;"> </colgroup>
<tbody>
<tr>
<td>1</td>
<td>2</td>
</tr>
<tr>
<td>3</td>
<td>4</td>
</tr>
</tbody>
</table>`;

  const getContent = (secondCellContent = '&nbsp;') =>
    `<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup> <col style="width: 33.2976%;"> <col style="width: 33.2976%;"> <col style="width: 33.2976%;"> </colgroup>
<tbody>
<tr>
<td>
${nestedTable}
</td>
<td>
${secondCellContent}
</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>`;

  const initialContent = getContent();

  it('TINY-9808: Paste table inside table should not merge the tables when table_merge_content_on_paste is set to false', () => {
    const editor = hook.editor();
    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
    const dataTransfer = Clipboard.copy(SugarElement.fromDom(editor.selection.getNode()));
    TinySelections.setSelection(editor, [ 0, 1, 0, 1 ], 0, [ 0, 1, 0, 1 ], 1);
    const html = dataTransfer.getData('text/html');
    Clipboard.pasteItems(SugarElement.fromDom(editor.selection.getNode()), {
      'text/html': html
    });
    TinyAssertions.assertContent(editor, getContent(nestedTable));
  });
});
