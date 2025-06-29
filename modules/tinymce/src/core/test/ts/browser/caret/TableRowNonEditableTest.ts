import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.TableRowNonEditableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({ base_url: '/project/tinymce/js/tinymce' }, [ ]);

  it('TINY-11077: Row with contenteditable="false" above should not shift selection while pressing enter.', async () => {
    const editor = hook.editor();
    editor.setContent(`
        <p>This is the table with noneditable row</p>
        <table>
            <tbody>
                <tr contenteditable="false">
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td>Text <br>String</td>
                </tr>
            </tbody>
        </table>`);

    TinySelections.setCursor(editor, [ 1, 0, 1, 0 ], 1);

    TinyContentActions.keydown(editor, Keys.enter());

    TinyAssertions.assertCursor(editor, [ 1, 0, 1, 0, 1 ], 0);
    TinyAssertions.assertContent(editor, `<p>This is the table with noneditable row</p>
<table>
<tbody>
<tr contenteditable="false">
<td>&nbsp;</td>
</tr>
<tr>
<td>
<p>Text</p>
<p><br>String</p>
</td>
</tr>
</tbody>
</table>`);
  });

  it('TINY-11383: selecting a CEF cell should still allow changing row type to header', () => {
    const editor = hook.editor();
    editor.setContent(`<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<tbody>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>`
    );

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowType', false, { type: 'header' });
    TinyAssertions.assertContent(editor, `<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<thead>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</thead>
</table>`
    );
  });

  it('TINY-11383: selecting a CEF cell should still allow changing row type to footer', () => {
    const editor = hook.editor();
    editor.setContent(`<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<tbody>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>`
    );

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowType', false, { type: 'footer' });
    TinyAssertions.assertContent(editor, `<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<tfoot>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</tfoot>
</table>`
    );
  });

  it('TINY-11383: selecting a CEF cell should still allow changing row type to body', () => {
    const editor = hook.editor();
    editor.setContent(`<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<thead>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</thead>
</table>`
    );

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableRowType', false, { type: 'body' });
    TinyAssertions.assertContent(editor, `<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-col-series="numeric" data-snooker-locked-cols="0">
<tbody>
<tr>
<td contenteditable="false">1</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>`
    );
  });
});
