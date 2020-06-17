import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi, UiChains } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.ContextMenuTest', (success, failure) => {
  SilverTheme();
  TablePlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const doc = Element.fromDom(document);
    const body = Body.body();
    const editorBody = Element.fromDom(editor.getBody());

    const sOpenContextMenu = (target: string) => Chain.asStep(editor, [
      tinyUi.cTriggerContextMenu('trigger context menu', target, '.tox-silver-sink [role="menuitem"]'),
      Chain.wait(0)
    ]);

    const sAssertFocusOnItem = (label: string, selector: string) => FocusTools.sTryOnSelector(`Focus should be on: ${label}`, doc, selector);

    const sCloseDialogAndWait = GeneralSteps.sequence([
      tinyUi.sWaitForPopup('wait for dialog', 'div[role="dialog"]'),
      Chain.asStep(editor, [
        UiChains.cCloseDialog('div[role="dialog"]')
      ]),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(body, 'div[role="dialog"]'), 50, 5000
      )
    ]);

    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });
    const sPressEnterKey = Keyboard.sKeydown(doc, Keys.enter(), { });

    const sRepeatDownArrowKey = (index) => GeneralSteps.sequence(Arr.range(index, () => sPressDownArrowKey));

    // 'index' points to the context menuitems while 'subindex' points to the sub menuitems
    const sSelectContextMenu = (label: string, selector: string, index: number, subindex: number) => GeneralSteps.sequence([
      sOpenContextMenu('td'),
      sRepeatDownArrowKey(subindex),
      Keyboard.sKeydown(doc, Keys.right(), {}),
      sRepeatDownArrowKey(index),
      sAssertFocusOnItem(label, selector),
      sPressEnterKey
    ]);

    const sSelectCellContextMenu = (label, selector, index) => sSelectContextMenu(label, selector, index, 0);
    const sSelectRowContextMenu = (label, selector, index) => sSelectContextMenu(label, selector, index, 1);
    const sSelectColumnContextMenu = (label, selector, index) => sSelectContextMenu(label, selector, index, 2);

    const tableHtml = '<table style="width: 100%;">' +
      '<tbody>' +
        '<tr>' +
          '<td></td>' +
          '<td></td>' +
        '</tr>' +
        '<tr>' +
          '<td></td>' +
          '<td></td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

    const tableWithCaptionHtml = '<table style="width: 100%;">' +
      '<caption>Caption</caption>' +
      '<tbody>' +
        '<tr>' +
          '<td></td>' +
          '<td></td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

    // Using a different table to test merge cells as selection using keydown (shift + arrow keys) does not work on Edge for some reason.
    // TODO: Investigate why selection does not work on Edge.
    const mergeTableHtml = '<table style="width: 100%;">' +
      '<tbody>' +
        '<tr>' +
          '<td data-mce-selected="1" data-mce-first-selected="1">a1</td>' +
          '<td>a2</td>' +
        '</tr>' +
        '<tr>' +
          '<td data-mce-selected="1" data-mce-last-selected="1">b1</td>' +
          '<td>b2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

    const sAssertHtmlStructure = (label: string, expectedHtml: string) => Assertions.sAssertStructure(label, ApproxStructure.build((s) => s.element('body', {
      children: [
        ApproxStructure.fromHtml(expectedHtml),
        s.theRest()
      ]
    })), editorBody);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Test context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        sAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")'),
        Keyboard.sKeydown(doc, Keys.up(), {}),
        sPressEnterKey,
        sCloseDialogAndWait
      ]),
      Log.stepsAsStep('TBA', 'Test caption context menus on a table', [
        tinyApis.sSetContent(tableWithCaptionHtml),
        sOpenContextMenu('caption'),
        sAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")'),
        Keyboard.sKeydown(doc, Keys.up(), {}),
        sPressEnterKey,
        sCloseDialogAndWait
      ]),
      Log.stepsAsStep('TBA', 'Test cell context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        Keyboard.sKeydown(doc, Keys.right(), {}),
        sAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Merge Cells', '.tox-collection__item:contains("Merge cells")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Split Cell', '.tox-collection__item:contains("Split cell")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")'),
        sPressEnterKey,
        sCloseDialogAndWait
      ]),
      Log.stepsAsStep('TBA', 'Test merge cells and split cell context menu options on a table', [
        tinyApis.sSetContent(mergeTableHtml),
        sSelectCellContextMenu('Merge Cells', '.tox-collection__item:contains("Merge cells")', 1),
        sAssertHtmlStructure('Assert Merge Cells', '<table><tbody><tr><td>a1<br />b1<br /></td><td>a2</td></tr><tr><td>b2</td></tr></tbody></table>'),

        sSelectCellContextMenu('Split Cell', '.tox-collection__item:contains("Split cell")', 2),
        sAssertHtmlStructure('Assert Split Cell', '<table><tbody><tr><td>a1<br />b1<br /></td><td>a2</td></tr><tr><td><br /></td><td>b2</td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TBA', 'Test row context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sSelectRowContextMenu('Insert Row Before', '.tox-collection__item:contains("Insert row before")', 0),
        sAssertHtmlStructure('Assert Insert Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectRowContextMenu('Insert Row After', '.tox-collection__item:contains("Insert row after")', 1),
        sAssertHtmlStructure('Assert Insert Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectRowContextMenu('Delete Row', '.tox-collection__item:contains("Delete row")', 2),
        sAssertHtmlStructure('Assert Row Deleted', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectRowContextMenu('Row Properties', '.tox-collection__item:contains("Row properties")', 3),
        sCloseDialogAndWait,

        sSelectRowContextMenu('Cut Row', '.tox-collection__item:contains("Cut row")', 4),
        sAssertHtmlStructure('Assert Row Deleted', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectRowContextMenu('Copy Row', '.tox-collection__item:contains("Copy row")', 5),

        sSelectRowContextMenu('Paste Row Before', '.tox-collection__item:contains("Paste row before")', 6),
        sAssertHtmlStructure('Assert Paste Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectRowContextMenu('Paste Row After', '.tox-collection__item:contains("Paste row after")', 7),
        sAssertHtmlStructure('Assert Paste Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TBA', 'Test delete table context menu', [
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        sRepeatDownArrowKey(4),
        sPressEnterKey,
        sAssertHtmlStructure('Assert table is deleted', '<p><br></p>')
      ]),
      Log.stepsAsStep('TBA', 'Test column context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sSelectColumnContextMenu('Insert Column Before', '.tox-collection__item:contains("Insert column before")', 0),
        sAssertHtmlStructure('Assert Insert Column', '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectColumnContextMenu('Insert Column After', '.tox-collection__item:contains("Insert column after")', 1),
        sAssertHtmlStructure('Assert Insert Column', '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr></tbody></table>'),

        sSelectColumnContextMenu('Delete Column', '.tox-collection__item:contains("Delete column")', 2),
        sAssertHtmlStructure('Assert Column Deleted', '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'table',
    toolbar: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
