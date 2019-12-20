import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, Touch, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Body, Element } from '@ephox/sugar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('MobileContextMenuTest', (success, failure) => {
  const detection = PlatformDetection.detect();
  const browser = detection.browser;
  const runTests = browser.isChrome() || browser.isFirefox() || browser.isSafari();
  if (!runTests) {
    return success();
  }

  SilverTheme();
  LinkPlugin();
  ImagePlugin();
  ImageToolsPlugin();
  TablePlugin();

  // Override the platform detection, so that it thinks we're on a touch device
  PlatformDetection.override({
    deviceType: {
      ...detection.deviceType,
      isTouch: () => true
    }
  });

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const doc = Element.fromDom(document);
    const dialogRoot = Body.body();
    const editorBody = Element.fromDom(editor.getBody());

    const sOpenContextMenu = (target: string) => Chain.asStep(target, [
      Chain.inject(editorBody),
      UiFinder.cFindIn(target),
      Touch.cTouchStart,
      Chain.wait(500),
      Chain.op(() => editor.fire('selectionchange')),
      Touch.cTouchEnd,
      Chain.wait(100),
      Chain.inject(dialogRoot),
      tinyUi.cWaitForPopup('trigger context menu', '.tox-silver-sink .tox-collection--horizontal [role="menuitem"]')
    ]);

    // Wait for dialog to open and close dialog
    const sWaitForAndCloseDialog = GeneralSteps.sequence([
      Chain.asStep(editor, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        Touch.cTapOn('.tox-button:contains("Cancel")')
      ]),
      Waiter.sTryUntil(
        'Wait for dialog to close',
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[role="dialog"]')
      )
    ]);

    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });
    const sPressEnterKey = Keyboard.sKeydown(doc, Keys.enter(), { });
    const sPressEscKey = Keyboard.sKeydown(doc, Keys.escape(), {});

    const sRepeatDownArrowKey = (index) => {
      return GeneralSteps.sequence(Arr.range(index, () => sPressDownArrowKey));
    };

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

    const contentInTableHtml = (content: string) => {
      return '<table style="width: 100%;">' +
       '<tbody>' +
          '<tr>' +
            `<td>${content}</td>` +
          '</tr>' +
        '</tbody>' +
      '</table>';
    };

    const imageInTableHtml = contentInTableHtml('<img src="' + imgSrc + '" width="160" height="100"/>');
    const placeholderImageInTableHtml = contentInTableHtml('<img src="' + imgSrc + '" width="160" height="100" data-mce-placeholder="1"/>');
    const linkInTableHtml = contentInTableHtml('<a href="http://tiny.cloud/">Tiny</a>');

    // In Firefox we add a a bogus br element after the link that fixes a gecko link bug when,
    // a link is placed at the end of block elements there is no way to move the caret behind the link.
    const sAssertRemoveLinkHtmlStructure = Assertions.sAssertStructure('Assert remove link', ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('Tiny')),
              s.zeroOrOne(s.element('br', {}))
            ]
          })
        ]
      });
    }), editorBody);

    const sAssertMenuItems = (items: string[]) => {
      return Chain.asStep(Body.body(), [
        Chain.fromParent(UiFinder.cFindIn(mobileContextMenuSelector), Arr.map(items, UiFinder.cExists))
      ]);
    };

    const mobileContextMenuSelector = 'div.tox-collection--horizontal';
    const selectors = {
      link: '.tox-collection__item:contains("Link...")',
      removelink: '.tox-collection__item:contains("Remove link")',
      openlink: '.tox-collection__item:contains("Open link")',
      cell: '.tox-collection__item:contains("Cell")',
      row: '.tox-collection__item:contains("Row")',
      column: '.tox-collection__item:contains("Column")',
      tableprops: '.tox-collection__item:contains("Table properties")',
      deletetable: '.tox-collection__item:contains("Delete table")',
      image: '.tox-collection__item:contains("Image")',
      editimage: '.tox-collection__item:contains("Edit image")'
    };

    const steps = [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Test context menus on empty editor', [
        sOpenContextMenu('p'),
        sAssertMenuItems([selectors.link]),
        sPressEscKey
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on a link', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud/">Tiny</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 'Ti'.length, [ 0, 0, 0 ], 'Ti'.length),
        sOpenContextMenu('a'),
        sAssertMenuItems([
          selectors.link,
          selectors.removelink,
          selectors.openlink
        ]),
        sPressEscKey,
        sOpenContextMenu('a'),
        FocusTools.sSetFocus('focus the first menu item', Body.body(), selectors.link),
        sPressDownArrowKey,
        sPressEnterKey,
        sAssertRemoveLinkHtmlStructure
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on a table', [
        tinyApis.sSetContent(tableHtml),
        sOpenContextMenu('td'),
        sAssertMenuItems([
          selectors.link,
          selectors.cell,
          selectors.row,
          selectors.column,
          selectors.tableprops,
          selectors.deletetable
        ]),
        FocusTools.sSetFocus('focus the table props item', Body.body(), selectors.tableprops),
        sPressEnterKey,
        sWaitForAndCloseDialog
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on image inside a table', [
        tinyApis.sSetContent(imageInTableHtml),
        sOpenContextMenu('img'),
        sAssertMenuItems([
          selectors.link,
          selectors.image,
          selectors.editimage,
          selectors.cell,
          selectors.row,
          selectors.column,
          selectors.tableprops,
          selectors.deletetable
        ]),
        FocusTools.sSetFocus('focus the image item', Body.body(), selectors.image),
        sPressEnterKey,
        sWaitForAndCloseDialog,
        sOpenContextMenu('img'),
        // Navigate to the "Image tools" menu item
        FocusTools.sSetFocus('focus the first menu item', Body.body(), selectors.link),
        sRepeatDownArrowKey(2),
        sPressEnterKey,
        sWaitForAndCloseDialog
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on link inside a table', [
        tinyApis.sSetContent(linkInTableHtml),
        sOpenContextMenu('a'),
        sAssertMenuItems([
          selectors.link,
          selectors.removelink,
          selectors.openlink,
          selectors.cell,
          selectors.row,
          selectors.column,
          selectors.tableprops,
          selectors.deletetable
        ]),
      ]),
      Log.stepsAsStep('TBA', 'Test context menus on placeholder image inside a table', [
        // Placeholder images shouldn't show the image/image tools options
        tinyApis.sSetContent(placeholderImageInTableHtml),
        tinyApis.sSelect('img', []),
        sOpenContextMenu('img'),
        sAssertMenuItems([
          selectors.link,
          selectors.cell,
          selectors.row,
          selectors.column,
          selectors.tableprops,
          selectors.deletetable
        ]),
      ])
    ];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image imagetools link table',
    toolbar: 'image editimage link table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true,
  }, () => {
    PlatformDetection.override(detection);
    success();
  }, (err, logs) => {
    PlatformDetection.override(detection);
    failure(err, logs);
  });
});
