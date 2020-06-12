import { Assertions, GeneralSteps, Keyboard, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Attr, Element, Html, Remove, Replication, SelectorFilter } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as TableDelete from 'tinymce/core/delete/TableDelete';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.delete.TableDeleteTest', (success, failure) => {
  Theme();

  const sAssertRawNormalizedContent = (editor: Editor, expectedContent: string) => Step.sync(() => {
    const element = Replication.deep(Element.fromDom(editor.getBody()));

    // Remove internal selection dom items
    Arr.each(SelectorFilter.descendants(element, '*[data-mce-bogus="all"]'), Remove.remove);
    Arr.each(SelectorFilter.descendants(element, '*'), (elm) => {
      Attr.remove(elm, 'data-mce-selected');
    });

    Assertions.assertHtml('Should be expected contents', expectedContent, Html.get(element));
  });

  const sDelete = (editor: Editor) => Step.sync(() => {
    const returnVal = TableDelete.backspaceDelete(editor, true);
    Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
  });

  const sBackspace = (editor: Editor) => Step.sync(() => {
    const returnVal = TableDelete.backspaceDelete(editor, false);
    Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
  });

  const sDeleteNoop = (editor: Editor) => Step.sync(() => {
    const returnVal = TableDelete.backspaceDelete(editor, true);
    Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
  });

  const sBackspaceNoop = (editor: Editor) => Step.sync(() => {
    const returnVal = TableDelete.backspaceDelete(editor, false);
    Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
  });

  const sKeyboardBackspace = (editor: Editor) => Keyboard.sKeystroke(Element.fromDom(editor.getDoc()), Keys.backspace(), {});

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),

      Logger.t('Delete selected cells or cell ranges', GeneralSteps.sequence([
        Logger.t('Collapsed range should be noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('Range in only one cell should be noop', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>ab</td><td>cd</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>ab</td><td>cd</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1)
        ])),

        Logger.t('Select all content in all cells removes table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('')
        ])),

        Logger.t('Select some cells should empty cells', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>c</td></tr></tbody></table>')
        ])),

        Logger.t('Select some cells between rows should empty cells', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 1, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><th>a</th><th>&nbsp;</th><th>&nbsp;</th></tr><tr><td>&nbsp;</td><td>e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 0)
        ])),

        Logger.t('delete weird selection with only tds', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td data-mce-selected="1">b</td><td>c</td></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>&nbsp;</td><td>c</td></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>')
        ])),

        Logger.t('delete weird selection with th', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><th>a</th><th data-mce-selected="1">b</th><th>c</th></tr><tr><td>d</td><td data-mce-selected="1">e</td><td>f</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><th>a</th><th>&nbsp;</th><th>c</th></tr><tr><td>d</td><td>&nbsp;</td><td>f</td></tr></tbody></table>')
        ])),

        Logger.t('Delete and empty cells', GeneralSteps.sequence([
          Logger.t('delete weird selection with th', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<table><tbody><tr><td><h1><br></h1></td></tr></tbody></table>'),
            tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0),
            sDelete(editor),
            sAssertRawNormalizedContent(editor, '<table><tbody><tr><td><br data-mce-bogus="1"></td></tr></tbody></table>')
          ]))
        ])),

        Logger.t('Delete partial selection across cells', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<table><tbody><tr><td><p>aa</p></td><td><p>bb</p></td><td><p>cc</p></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 1, 0, 0 ], 1),
          sKeyboardBackspace(editor),
          sAssertRawNormalizedContent(editor, '<table><tbody><tr><td><br data-mce-bogus="1"></td><td><br data-mce-bogus="1"></td><td><p>cc</p></td></tr></tbody></table>')
        ]))
      ])),

      Logger.t('Delete all single cell content', GeneralSteps.sequence([
        Logger.t('All content selected in single cell with only text deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with only text deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
          sBackspace(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with paragraph deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><p>a</p></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with multiple paragraphs deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><p>a</p><p>b</p><p>c</p></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 2, 0 ], 1),
          sBackspace(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with list deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><ul><li>&nbsp;</li></ul></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with list + start attribute deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><ol start="2"><li>a</li><li>b</li></ol></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><ol start="2"><li>&nbsp;</li></ol></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with indented text deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><div style="padding-left: 40px;">a</div></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><div style="padding-left: 40px;">&nbsp;</div></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with complex selection (1) deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><p>a</p><ul><li style="list-style-type: none;"><ul><li>b</li></ul></li><li><strong>c</strong></li></ul></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 1, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><ul><li>&nbsp;</li></ul></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with complex selection (2) deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><p class="abc">a</p><p><strong>c</strong></p></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0)
        ])),

        Logger.t('All content selected in single cell with complex selection (3) deletes only content', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><div><p class="abc"><span style="text-decoration: underline;">a</span></p></div><div style="font-size: 12px;"><p class="def"><span style="color: red">c</span></p></div></td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td><div style="font-size: 12px;"><p class="def">&nbsp;</p></div></td></tr></tbody></table>'),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 0)
        ]))
      ])),

      Logger.t('Delete between cells as caret', GeneralSteps.sequence([
        Logger.t('Delete between cells as a caret', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),

        Logger.t('Backspace between cells as a caret', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0),
          sBackspace(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),

        Logger.t('Delete in middle of contents in cells as a caret', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0),
          sDeleteNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),

        Logger.t('Backspace in middle of contents in cells as a caret', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 1, [ 0, 0, 0, 1, 0 ], 1),
          sBackspaceNoop(editor),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ]))
      ])),

      Logger.t('Delete inside table caption', GeneralSteps.sequence([
        Logger.t('Simulate result of the triple click (selection beyond caption)', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0),
          sDelete(editor),
          sAssertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>')
        ])),

        Logger.t('Deletion at the left edge', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 0),
          sBackspace(editor),
          tinyApis.sAssertContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>')
        ])),

        Logger.t('Deletion at the right edge', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 3),
          sDelete(editor),
          tinyApis.sAssertContent('<table><caption>abc</caption><tbody><tr><td>a</td></tr></tbody></table>')
        ])),

        Logger.t('Backspace at last character positon', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>a</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          sBackspace(editor),
          sAssertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>')
        ])),

        Logger.t('Delete at last character positon', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>a</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 0),
          sDelete(editor),
          sAssertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>')
        ])),

        Logger.t('Backspace at character positon in middle of caption', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>ab</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          sBackspaceNoop(editor)
        ])),

        Logger.t('Delete at character positon in middle of caption', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption>ab</caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          sDeleteNoop(editor)
        ])),

        Logger.t('Caret in caption with blocks', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption><p>abc</p></caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0, 0 ], 1),
          sDeleteNoop(editor)
        ])),

        Logger.t('Debris like empty nodes and brs constitute an empty caption', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><caption><p><br></p><p data-mce-caret="after" data-mce-bogus="all"><br data-mce-bogus="1"></p></caption><tbody><tr><td>a</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0 ], 0),
          sDelete(editor),
          sAssertRawNormalizedContent(editor, '<table class="mce-item-table"><caption><br data-mce-bogus="1"></caption><tbody><tr><td>a</td></tr></tbody></table>')
        ]))
      ])),

      Logger.t('Delete partially selected tables', GeneralSteps.sequence([
        Logger.t('Delete from before table into table', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertSelection([ 1, 0, 0, 0 ], 0, [ 1, 0, 0, 0 ], 0),
          tinyApis.sAssertContent('<p>a</p><table><tbody><tr><td>&nbsp;</td><td>b</td></tr></tbody></table>')
        ])),

        Logger.t('Delete from after table into table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 1, [ 1, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertSelection([ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>&nbsp;</td></tr></tbody></table><p>a</p>')
        ])),

        Logger.t('Delete from one table into another table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><table><tbody><tr><td>c</td><td>d</td></tr></tbody></table>'),
          tinyApis.sSetSelection([ 0, 0, 0, 1, 0 ], 1, [ 1, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertSelection([ 0, 0, 0, 1 ], 0, [ 0, 0, 0, 1 ], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>&nbsp;</td></tr></tbody></table><table><tbody><tr><td>c</td><td>d</td></tr></tbody></table>')
        ]))
      ])),
      Logger.t('delete before/after table', GeneralSteps.sequence([
        Logger.t('Delete with cursor before table', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
          tinyApis.sAssertContent('<p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>')
        ])),
        Logger.t('Backspace after table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>'),
          tinyApis.sSetCursor([ 1, 0 ], 0),
          sBackspace(editor),
          tinyApis.sAssertSelection([ 1, 0 ], 0, [ 1, 0 ], 0),
          tinyApis.sAssertContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p>')
        ])),
        Logger.t('Delete with cursor before table inside of table', GeneralSteps.sequence([
          tinyApis.sSetContent('<table><tbody><tr><td><p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0, 0, 0, 0, 0 ], 1),
          sDelete(editor),
          tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0, 0 ], 1),
          tinyApis.sAssertContent('<table><tbody><tr><td><p>a</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></td><td>b</td></tr></tbody></table>')
        ])),
        Logger.t('Backspace after table inside of table', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>x</p><table><tbody><tr><td><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p></td><td>b</td></tr></tbody></table>'),
          tinyApis.sSetCursor([ 0, 0 ], 0), // This is needed because of fake carets messing up the path in FF
          tinyApis.sSetCursor([ 1, 0, 0, 0, 1, 0 ], 0),
          sBackspace(editor),
          tinyApis.sAssertSelection([ 1, 0, 0, 0, 1, 0 ], 0, [ 1, 0, 0, 0, 1, 0 ], 0),
          tinyApis.sAssertContent('<p>x</p><table><tbody><tr><td><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>a</p></td><td>b</td></tr></tbody></table>')
        ]))
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
