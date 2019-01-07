import { Chain, Keyboard, Keys, Log, Mouse, Pipeline, UnitTest, FocusTools, NamedChain, Assertions, GeneralSteps, Waiter, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi, TinyDom } from '@ephox/mcagar';
import { Element, Replication, SelectorFilter, Remove, Html } from '@ephox/sugar';

import ImagePlugin from 'src/plugins/image/main/ts/Plugin';
import LinkPlugin from 'src/plugins/link/main/ts/Plugin';
import TablePlugin from 'src/plugins/table/main/ts/Plugin';
import SilverTheme from 'src/themes/silver/main/ts/Theme';
import { Arr } from '@ephox/katamari';

UnitTest.asynctest('SilverContextMenuTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();
  ImagePlugin();
  TablePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const doc = Element.fromDom(document);

    const sOpenContextMenu = (target) => {
      return Chain.asStep(editor, [
        tinyUi.cTriggerContextMenu('trigger context menu', target, '.tox-silver-sink [role="menuitem"]'),
        Chain.wait(0)
      ]);
    };

    // Assert focus is on the expected menu item
    const sAssertFocusOnItem = (label, selector) => {
      return FocusTools.sTryOnSelector(
        `Focus should be on: ${label}`,
        doc,
        selector
      );
    };

    const sWaitForAndCloseDialog = GeneralSteps.sequence([
      Chain.asStep(editor, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        Mouse.cClickOn('.tox-button:contains("Cancel")')
      ]),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[role="dialog"]'), 50, 5000
      )
    ]);

    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });

    const sRepeatKeyDown = (index) => {
      const pressDown = [];
      for (let i = 0; i < index; i++) {
        pressDown.push(sPressDownArrowKey);
      }
      return GeneralSteps.sequence(pressDown);
    };

    const sPressEnterKey = Keyboard.sKeydown(doc, Keys.enter(), { });

    const sSelectCells = Keyboard.sKeydown(Element.fromDom(editor.getDoc()), Keys.down(), { shift: true });

    // 'index' points to the context menuitems while 'subindex' points to the sub menuitems
    const sSelectContextMenu = (label, selector, index, subindex) => {
      return GeneralSteps.sequence([
        sOpenContextMenu('td'),
        sRepeatKeyDown(subindex),
        Keyboard.sKeydown(doc, Keys.right(), {}),
        sRepeatKeyDown(index),
        sAssertFocusOnItem(label, selector),
        sPressEnterKey
      ]);
    };

    const sSelectCellContextMenu = GeneralSteps.sequence([
      sOpenContextMenu('td'),
      sPressDownArrowKey,
      Keyboard.sKeydown(doc, Keys.right(), {}),
      sPressDownArrowKey
    ]);

    const sSelectRowContextMenu = (label, selector, index) => sSelectContextMenu(label, selector, index, 2);
    const sSelectColumnContextMenu = (label, selector, index) => sSelectContextMenu(label, selector, index, 3);

    const tableHtml = '<table style = "width: 100%;">' +
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

    const imgSrc = '../img/dogleft.jpg';

    const imageInTableHtml = '<table style = "width: 100%;">' +
    '<tbody>' +
      '<tr>' +
        '<td><img src="' + imgSrc + '" width="160" height="100"/></td>' +
      '</tr>' +
    '</tbody>' +
    '</table>';

    const linkInTableHtml = '<table style = "width: 100%;">' +
    '<tbody>' +
      '<tr>' +
        '<td><a href="http://tiny.cloud/">Tiny</a></td>' +
      '</tr>' +
    '</tbody>' +
    '</table>';

    const sAssertHtmlStructure = (label, expectedHtml) => Chain.asStep({editor}, [ NamedChain.read('editor', Chain.op((editor) => {
      const elm = Replication.deep(Element.fromDom(editor.getBody()));
      Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus="all"]'), Remove.remove);
      const actualHtml = Html.get(elm);
      Assertions.assertHtmlStructure(label, `<body>${expectedHtml}</body>`, `<body>${actualHtml}</body>`);
    }))]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'Test context menus on empty editor', [
        sOpenContextMenu('p'),
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressEnterKey,
        sWaitForAndCloseDialog
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on a link', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud/">Tiny</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 'Ti'.length, [ 0, 0, 0 ], 'Ti'.length),
        sOpenContextMenu('a'),
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Remove Link', '.tox-collection__item:contains("Remove link")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sOpenContextMenu('a'),
        sPressDownArrowKey,
        sPressEnterKey,
        sAssertHtmlStructure('Assert remove link', '<p>Tiny</p>')
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressDownArrowKey,
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
        sWaitForAndCloseDialog,
      ]),
      Log.stepsAsStep('TBA', 'Test cell context menus on a table', [
        sOpenContextMenu('td'),
        sPressDownArrowKey,
        Keyboard.sKeydown(doc, Keys.right(), {}),
        sAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Merge Cells', '.tox-collection__item:contains("Merge cells")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Split Cell', '.tox-collection__item:contains("Split cell")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Cell Properties', '.tox-collection__item:contains("Cell properties")'),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sSelectCells,
        sSelectCellContextMenu,
        sPressEnterKey,
        sAssertHtmlStructure('Assert Merge Cells', '<table><tbody><tr><td rowspan="2"><br></td><td><br></td></tr><tr><td><br></td></tr></tbody></table>'),
        sSelectCellContextMenu,
        sPressDownArrowKey,
        sPressEnterKey,
        sAssertHtmlStructure('Assert Split Cell', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TBA', 'Test row context menus on a table', [
        sSelectRowContextMenu('Insert Row Before', '.tox-collection__item:contains("Insert row before")', 0),
        sAssertHtmlStructure('Assert Insert Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),
        sSelectRowContextMenu('Insert Row After', '.tox-collection__item:contains("Insert row after")', 1),
        sAssertHtmlStructure('Assert Insert Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),
        sSelectRowContextMenu('Delete Row', '.tox-collection__item:contains("Delete row")', 2),
        sAssertHtmlStructure('Assert Row Deleted', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),
        sSelectRowContextMenu('Row Properties', '.tox-collection__item:contains("Row properties")', 3),
        sWaitForAndCloseDialog,
        sSelectRowContextMenu('Cut Row', '.tox-collection__item:contains("Cut row")', 4),
        sAssertHtmlStructure('Assert Row Deleted', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),
        sSelectRowContextMenu('Copy Row', '.tox-collection__item:contains("Copy row")', 5),
        sSelectRowContextMenu('Paste Row Before', '.tox-collection__item:contains("Paste row before")', 6),
        sAssertHtmlStructure('Assert Paste Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),
        sSelectRowContextMenu('Paste Row After', '.tox-collection__item:contains("Paste row after")', 7),
        sAssertHtmlStructure('Assert Paste Row', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TBA', 'Test delete table context menu', [
        sOpenContextMenu('td'),
        sRepeatKeyDown(5),
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
        sAssertHtmlStructure('Assert Column Deleted', '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'),
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on image inside a table', [
        tinyApis.sSetContent(imageInTableHtml),
        sOpenContextMenu('img'),
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Image', '.tox-collection__item:contains("Image")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Edit Image', '.tox-collection__item:contains("Edit image")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")'),
        sRepeatKeyDown(2),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sOpenContextMenu('img'),
        sRepeatKeyDown(2),
        sPressEnterKey,
        sWaitForAndCloseDialog
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on link inside a table', [
        tinyApis.sSetContent(linkInTableHtml),
        sOpenContextMenu('a'),
        sAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Remove Link', '.tox-collection__item:contains("Remove link")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")'),
        sPressDownArrowKey,
        sAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")')
      ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image imagetools link table',
    toolbar: 'image editimage link table',
    indent: false,
    base_url: '/project/js/tinymce',
    image_caption: true,
  }, success, failure);
});