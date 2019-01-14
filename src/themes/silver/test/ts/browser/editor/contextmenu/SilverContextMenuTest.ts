import { Chain, Keyboard, Keys, Log, Pipeline, UnitTest, FocusTools, NamedChain, Assertions, GeneralSteps, Waiter, UiFinder } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi, TinyDom, UiChains } from '@ephox/mcagar';
import { Element, Replication, SelectorFilter, Remove, Html } from '@ephox/sugar';

import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('SilverContextMenuTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();
  ImagePlugin();
  ImageToolsPlugin();
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

    // Wait for dialog to open and close dialog
    const sWaitForAndCloseDialog = GeneralSteps.sequence([
      Chain.asStep(editor, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        UiChains.cCloseDialog('div[role="dialog"]')
      ]),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[role="dialog"]'), 50, 5000
      )
    ]);

    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });

    const sRepeatDownArrowKey = (index) => {
      const pressDown = [];
      for (let i = 0; i < index; i++) {
        pressDown.push(sPressDownArrowKey);
      }
      return GeneralSteps.sequence(pressDown);
    };

    const sPressEnterKey = Keyboard.sKeydown(doc, Keys.enter(), { });

    // 'index' points to the context menuitems while 'subindex' points to the sub menuitems
    const sSelectContextMenu = (label, selector, index, subindex) => {
      return GeneralSteps.sequence([
        sOpenContextMenu('td'),
        sRepeatDownArrowKey(subindex),
        Keyboard.sKeydown(doc, Keys.right(), {}),
        sRepeatDownArrowKey(index),
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

    // Using a different table to test merge cells as selection using keydown (shift + arrow keys) does not work on Edge for some reason.
    // TODO: Investigate why selection does not work on Edge.
    const mergeTableHtml = '<table style = "width: 100%;">' +
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

    const platform = PlatformDetection.detect();

    // In Firefox we add a a bogus br element after the link that fixes a gecko link bug when,
    // a link is placed at the end of block elements there is no way to move the caret behind the link.
    const sAssertRemoveLinkHtmlStructure = platform.browser.isFirefox() ? sAssertHtmlStructure('Assert remove link', '<p>Tiny<br></p>') :
      sAssertHtmlStructure('Assert remove link', '<p>Tiny</p>');

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
        sAssertRemoveLinkHtmlStructure
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
        tinyApis.sSetContent(tableHtml),
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
        sWaitForAndCloseDialog
      ]),
      Log.stepsAsStep('TBA', 'Test merge cells and split cell context menu options on a table', [
        tinyApis.sSetContent(mergeTableHtml),
        sSelectCellContextMenu,
        sPressEnterKey,
        sAssertHtmlStructure('Assert Merge Cells', '<table><tbody><tr><td>a1<br />b1<br /></td><td>a2</td></tr><tr><td>b2</td></tr></tbody></table>'),
        sSelectCellContextMenu,
        sPressDownArrowKey,
        sPressEnterKey,
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
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        sRepeatDownArrowKey(5),
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
        sRepeatDownArrowKey(2),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sOpenContextMenu('img'),
        sRepeatDownArrowKey(2),
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