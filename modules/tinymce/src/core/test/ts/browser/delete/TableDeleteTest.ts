import { Assertions, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Html, Remove, Replication, SelectorFilter, SelectorFind } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as TableDelete from 'tinymce/core/delete/TableDelete';

describe('browser.tinymce.core.delete.TableDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const assertRawNormalizedContent = (editor: Editor, expectedContent: string) => {
    const element = Replication.deep(TinyDom.body(editor));

    // Remove internal selection dom items
    Arr.each(SelectorFilter.descendants(element, '*[data-mce-bogus="all"]'), Remove.remove);
    Arr.each(SelectorFilter.descendants(element, '*'), (elm) => {
      Attribute.remove(elm, 'data-mce-selected');
    });

    Assertions.assertHtml('Should be expected contents', expectedContent, Html.get(element));
  };

  const doCommand = (editor: Editor, forward: boolean) => {
    const returnVal = TableDelete.backspaceDelete(editor, forward);
    returnVal.each((apply) => apply());
    return returnVal.isSome();
  };

  const doDelete = (editor: Editor) => {
    const returnVal = doCommand(editor, true);
    assert.isTrue(returnVal, 'Should return true since the operation should have done something');
  };

  const doBackspace = (editor: Editor) => {
    const returnVal = doCommand(editor, false);
    assert.isTrue(returnVal, 'Should return true since the operation should have done something');
  };

  const noopDelete = (editor: Editor) => {
    const returnVal = doCommand(editor, true);
    assert.isFalse(returnVal, 'Should return false since the operation is a noop');
  };

  const noopBackspace = (editor: Editor) => {
    const returnVal = doCommand(editor, false);
    assert.isFalse(returnVal, 'Should return false since the operation is a noop');
  };

  const keyboardBackspace = (editor: Editor) => TinyContentActions.keystroke(editor, Keys.backspace());

  context('Delete selected cells or cell ranges', () => {
    it('Collapsed range should be noop', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('Range in only one cell should be noop', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>ab</td><td>cd</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>ab</td><td>cd</td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
    });

    it('Select all content in all cells removes table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '');
    });

    it('Select some cells should empty cells', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>c</td></tr></tbody></table>');
    });

    it('Select some cells between rows should empty cells', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 1, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><th>a</th><th>&nbsp;</th><th>&nbsp;</th></tr><tr><td>&nbsp;</td><td>e</td><td>f</td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 0);
    });

    it('delete weird selection with only tds', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td data-mce-selected="1">b</td><td>c</td></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>&nbsp;</td><td>c</td></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>');
    });

    it('delete weird selection with th', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><th>a</th><th data-mce-selected="1">b</th><th>c</th></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><th>a</th><th>&nbsp;</th><th>c</th></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>');
    });

    it('Delete block in cell resulting in empty cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><h1><br></h1></td></tr></tbody></table>', { format: 'raw' });
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
      doDelete(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><tbody><tr><td><br data-mce-bogus="1"></td></tr></tbody></table>');
    });

    it('Delete partial selection across cells', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>aa</p></td><td><p>bb</p></td><td><p>cc</p></td></tr></tbody></table>', { format: 'raw' });
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 1, 0, 0 ], 1);
      keyboardBackspace(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><tbody><tr><td><br data-mce-bogus="1"></td><td><br data-mce-bogus="1"></td><td><p>cc</p></td></tr></tbody></table>');
    });

    it('TINY-7891: Delete a single contenteditable=false cell', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody>' +
        '<tr><td contenteditable="false" data-mce-selected="1">a</td><td>b</td><td>c</td></tr>' +
        '<tr><td>d</td><td>e</td><td>f</td></tr>' +
        '</tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      // Note: This uses the command to ensure it works with CefDelete
      editor.execCommand('Delete');
      TinyAssertions.assertContentPresence(editor, {
        'td[data-mce-selected="1"]': 0
      });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td><td>b</td><td>c</td></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>');
    });

    it('TINY-7891: Delete a contenteditable=false cell in a range selection', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody>' +
        '<tr><td contenteditable="false" data-mce-selected="1">a</td><td>b</td><td>c</td></tr>' +
        '<tr><td data-mce-selected="1">d</td><td>e</td><td>f</td></tr>' +
        '</tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      // When we set the selection, SelectionOverrides removes our data-mce-selected attributes. So we need to put it back
      SelectorFind.descendant(TinyDom.body(editor), 'tr:nth-child(2) td').each((elm) => Attribute.set(elm, 'data-mce-selected', '1'));
      // Note: This uses the command to ensure it works with CefDelete
      editor.execCommand('Delete');
      TinyAssertions.assertContentPresence(editor, {
        'td[data-mce-selected="1"]': 2
      });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td><td>b</td><td>c</td></tr><tr><td>&nbsp;</td><td>e</td><td>f</td></tr></tbody></table>');
    });

    it('TINY-7891: Delete multiple contenteditable=false cells in a range selection', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody>' +
        '<tr><td contenteditable="false" data-mce-selected="1">a</td><td contenteditable="false" data-mce-selected="1">b</td><td>c</td></tr>' +
        '<tr><td contenteditable="false" data-mce-selected="1">d</td><td contenteditable="false" data-mce-selected="1">e</td><td>f</td></tr>' +
        '</tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      // Note: This uses the command to ensure it works with CefDelete
      editor.execCommand('Delete');
      TinyAssertions.assertContentPresence(editor, {
        'td[data-mce-selected="1"]': 4
      });
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>c</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>f</td></tr></tbody></table>');
    });

    it('TINY-10254: Delete a selection that involve a table and some content both inside another table should not delete the first table as well', () => {
      const editor = hook.editor();
      editor.setContent(`<table>
        <tbody>
          <tr>
            <td>
              <table>
                <tbody>
                  <tr>
                    <td>table 1</td>
                    <td>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
              <table>
                <tbody>
                  <tr>
                    <td>table 2</td>
                    <td>abc</td>
                  </tr>
                </tbody>
              </table>
              <p>content</p>
            </td>
          </tr>
        </tbody>
      </table>`);
      // this `setCursor` is needed for FireFox since otherwinse the `setSelection` triggers an error
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 1, 0, 0, 1, 0 ], 0);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 1, 0, 0, 1, 0 ], 1, [ 0, 0, 0, 0, 2, 0 ], 3);
      editor.execCommand('Delete');
      TinyAssertions.assertContent(editor,
        '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<table>' +
                '<tbody>' +
                  '<tr>' +
                    '<td>table 1</td>' +
                    '<td>&nbsp;</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
              '<table>' +
                '<tbody>' +
                  '<tr>' +
                    '<td>table 2</td>' +
                    '<td>a</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
              '<p>tent</p>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
      );
    });
  });

  context('Delete all single cell content', () => {
    it('Delete all content selected in single cell with only text deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0);
    });

    it('Backspace all content selected in single cell with only text deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
      doBackspace(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with paragraph deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>a</p></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with multiple paragraphs deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>a</p><p>b</p><p>c</p></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 2, 0 ], 1);
      doBackspace(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with list deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><ul><li>&nbsp;</li></ul></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with list + start attribute deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><ol start="2"><li>a</li><li>b</li></ol></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><ol start="2"><li>&nbsp;</li></ol></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with indented text deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><div style="padding-left: 40px;">a</div></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><div style="padding-left: 40px;">&nbsp;</div></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with complex selection (1) deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>a</p><ul><li style="list-style-type: none;"><ul><li>b</li></ul></li><li><strong>c</strong></li></ul></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 1, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><ul><li>&nbsp;</li></ul></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with complex selection (2) deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p class="abc">a</p><p><strong>c</strong></p></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
    });

    it('All content selected in single cell with complex selection (3) deletes only content', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><div><p class="abc"><span style="text-decoration: underline;">a</span></p></div><div style="font-size: 12px;"><p class="def"><span style="color: red">c</span></p></div></td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><div style="font-size: 12px;"><p class="def">&nbsp;</p></div></td></tr></tbody></table>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0);
    });
  });

  context('Delete between cells as caret', () => {
    it('Delete between cells as a caret', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Backspace between cells as a caret', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Delete in middle of contents in cells as a caret', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
      noopDelete(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Backspace in middle of contents in cells as a caret', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 0, 0, 0, 1, 0 ], 1);
      noopBackspace(editor);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });
  });

  context('Delete inside table caption', () => {
    it('Simulate result of the triple click (selection beyond caption)', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0);
      doDelete(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>');
    });

    it('Deletion at the left edge', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertContent(editor, '<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>');
    });

    it('Deletion at the right edge', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertContent(editor, '<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>');
    });

    it('Backspace at last character position', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>a</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      doBackspace(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>');
    });

    it('Delete at last character position', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>a</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      doDelete(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>');
    });

    it('Backspace at character positon in middle of caption', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>ab</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      noopBackspace(editor);
    });

    it('Delete at character positon in middle of caption', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>ab</caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      noopDelete(editor);
    });

    it('Caret in caption with blocks', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption><p>abc</p></caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      noopDelete(editor);
    });

    it('Debris like empty nodes and brs constitute an empty caption', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption><p><br></p><p data-mce-caret="after" data-mce-bogus="all"><br data-mce-bogus="1"></p></caption><tbody><tr><td>a</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      doDelete(editor);
      assertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>');
    });
  });

  context('Delete partially selected tables', () => {
    it('TINY-6044: Fully select and delete from before table into table - keep paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><table><tbody><tr><td>&nbsp;</td><td>b</td></tr></tbody></table>');
    });

    it('TINY-6044: Fully select and delete from after table into table - remove paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('TINY-6044: Partially select and delete from before table into table', () => {
      const editor = hook.editor();
      editor.setContent('<p>abcd</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 1, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
      TinyAssertions.assertContent(editor, '<p>ab</p><table><tbody><tr><td>&nbsp;</td><td>b</td></tr></tbody></table>');
    });

    it('TINY-7596: Partially select and delete from before table into table with a list to be cleaned after deletion', () => {
      const editor = hook.editor();
      editor.setContent('<p>a123</p><table><tbody><tr><td><ul><li>li1</li><li>li2</li></ul><p>456</p></td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 1, 0, 0, 0, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
      TinyAssertions.assertContent(editor, '<p>a1</p><table><tbody><tr><td><p>56</p></td><td>b</td></tr></tbody></table>');
    });

    it('TINY-7596: Partially select and delete from before table into table multiple paragraphs within cell', () => {
      const editor = hook.editor();
      editor.setContent('<p>a123</p><table><tbody><tr><td><p>456</p><p>789</p></td><td>b</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 1, 0, 0, 0, 0, 0 ], 2);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
      TinyAssertions.assertContent(editor, '<p>a1</p><table><tbody><tr><td><p>6</p><p>789</p></td><td>b</td></tr></tbody></table>');
    });

    it('TINY-6044: Partially select and delete from after table into table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>abcd</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 1, 0 ], 2);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>cd</p>');
    });

    it('TINY-6044: Delete from one table into another table', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>' +
        '<table><tbody><tr><td>c</td><td>d</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 1, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>d</td></tr></tbody></table>'
      );
    });

    it('TINY-6044: Delete from one table into another table with content between', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>' +
        '<p>aa</p>' +
        '<table><tbody><tr><td>c</td><td>d</td></tr></tbody></table>' +
        '<p>bb</p>' +
        '<table><tbody><tr><td>e</td><td>f</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 1, [ 4, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>f</td></tr></tbody></table>'
      );
    });

    it('TINY-6044: Delete from one table into another table with all cells selected', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>' +
        '<table><tbody><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 1, 0, 1, 1, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>'
      );
    });

    it('TINY-7596: Delete from one table into another with partial selections in both tables', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d123</td></tr></tbody></table>' +
        '<table><tbody><tr><td>456e</td><td>f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 1, 1, 0 ], 1, [ 1, 0, 0, 0, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 1, 1, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>' +
        '<table><tbody><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
    });

    it('TINY-7596: Delete from one table into another with partial selection and multiple cells selected in both tables', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c123</td><td>d</td></tr></tbody></table>' +
        '<table><tbody><tr><td>e</td><td>456f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 1, [ 1, 0, 0, 1, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>&nbsp;</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
    });

    it('TINY-7596: Delete partial selection across cells, with entire row selected in both tables in between', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a123</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>' +
        '<table><tbody><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>456h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 1, [ 1, 0, 1, 1, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>h</td></tr></tbody></table>'
      );
    });

    it('TINY-7596: Delete partial selection across cells, with entire row selected in both tables in between (with content in between)', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a123</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>' +
        '<p>aa</p>' +
        '<table><tbody><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>456h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 1, [ 2, 0, 1, 1, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>h</td></tr></tbody></table>'
      );
    });

    it('TINY-7596: Delete from one table into another with partial selections in both tables and content between', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c123</td><td>d</td></tr></tbody></table>' +
        '<p>aa</p>' +
        '<table><tbody><tr><td>e</td><td>456f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 1, [ 2, 0, 0, 1, 0 ], 3);
      doDelete(editor);
      TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 1);
      TinyAssertions.assertContent(
        editor,
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>&nbsp;</td></tr></tbody></table>' +
        '<table><tbody><tr><td>&nbsp;</td><td>f</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>'
      );
    });
  });

  context('delete before/after table', () => {
    it('Delete with cursor before table', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
      TinyAssertions.assertContent(editor, '<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Backspace after table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>');
    });

    it('Delete with cursor before table inside of table', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 1);
      doDelete(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0, 0 ], 1);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></td><td>b</td></tr></tbody></table>');
    });

    it('Backspace after table inside of table', () => {
      const editor = hook.editor();
      editor.setContent('<p>x</p><table><tbody><tr><td><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p></td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0); // This is needed because of fake carets messing up the path in FF
      TinySelections.setCursor(editor, [ 1, 0, 0, 0, 1, 0 ], 0);
      doBackspace(editor);
      TinyAssertions.assertSelection(editor, [ 1, 0, 0, 0, 1, 0 ], 0, [ 1, 0, 0, 0, 1, 0 ], 0);
      TinyAssertions.assertContent(editor, '<p>x</p><table><tbody><tr><td><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p></td><td>b</td></tr></tbody></table>');
    });
  });
});
