import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyLoader, TinyUi, UiChains } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('SilverContextMenuTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();
  ImagePlugin();
  ImageToolsPlugin();
  TablePlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const doc = Element.fromDom(document);
    const editorBody = Element.fromDom(editor.getBody());

    const sOpenContextMenu = (target) => Chain.asStep(editor, [
      tinyUi.cTriggerContextMenu('trigger context menu', target, '.tox-silver-sink .tox-collection [role="menuitem"]'),
      Chain.wait(0)
    ]);

    // Assert focus is on the expected menu item
    const sAssertFocusOnItem = (label, selector) => FocusTools.sTryOnSelector(`Focus should be on: ${label}`, doc, selector);

    // Wait for dialog to open and close dialog
    const sWaitForAndCloseDialog = GeneralSteps.sequence([
      Chain.asStep(editor, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        UiChains.cCloseDialog('div[role="dialog"]')
      ]),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[role="dialog"]')
      )
    ]);

    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });
    const sPressEnterKey = Keyboard.sKeydown(doc, Keys.enter(), { });

    const sRepeatDownArrowKey = (index) => GeneralSteps.sequence(Arr.range(index, () => sPressDownArrowKey));

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

    const imgSrc = '../img/dogleft.jpg';

    const contentInTableHtml = (content: string) => '<table style="width: 100%;">' +
       '<tbody>' +
          '<tr>' +
            `<td>${content}</td>` +
          '</tr>' +
        '</tbody>' +
      '</table>';

    const imageInTableHtml = contentInTableHtml('<img src="' + imgSrc + '" width="160" height="100"/>');
    const placeholderImageInTableHtml = contentInTableHtml('<img src="' + imgSrc + '" width="160" height="100" data-mce-placeholder="1"/>');
    const linkInTableHtml = contentInTableHtml('<a href="http://tiny.cloud/">Tiny</a>');

    // In Firefox we add a a bogus br element after the link that fixes a gecko link bug when,
    // a link is placed at the end of block elements there is no way to move the caret behind the link.
    const sAssertRemoveLinkHtmlStructure = Assertions.sAssertStructure('Assert remove link', ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Tiny')),
            s.zeroOrOne(s.element('br', {}))
          ]
        })
      ]
    })), editorBody);

    Pipeline.async({}, [
      tinyApis.sFocus(),
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
        sWaitForAndCloseDialog
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
        // Navigate back to the "Image"" menu item
        sRepeatDownArrowKey(2),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sOpenContextMenu('img'),
        // Navigate to the "Image tools" menu item
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
      Log.stepsAsStep('TBA', 'Test context menus on placeholder image inside a table', [
        // Placeholder images shouldn't show the image/image tools options
        tinyApis.sSetContent(placeholderImageInTableHtml),
        tinyApis.sSelect('img', []),
        sOpenContextMenu('img'),
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
        sAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image imagetools link table',
    toolbar: 'image editimage link table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, success, failure);
});
