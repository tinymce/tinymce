import { Log, Pipeline, Chain, UiFinder, FocusTools, Keyboard, Keys, GeneralSteps, Waiter, NamedChain, Assertions, Mouse } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi, UiChains} from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { Element, Replication, SelectorFilter, Html, Remove } from '@ephox/sugar';
import { Arr } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.plugins.table.ContextToolbarTest', (success, failure) => {
  Theme();
  Plugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);

    const tableHtml = '<table style = "width: 5%;">' +
    '<tbody>' +
      '<tr>' +
        '<td></td>' +
      '</tr>' +
    '</tbody>' +
    '</table>';

    const sAddTableAndOpenContextToolbar = (html: string) => GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyUi.sWaitForUi('Wait for table context toolbar', '.tox-toolbar button[aria-label="Table properties"]'),
    ]);

    // Use keyboard shortcut ctrl+F9 to navigate to the context toolbar
    const sPressKeyboardShortcutKey = Keyboard.sKeydown(Element.fromDom(editor.getDoc()), 120, { ctrl: true });
    const sPressRightArrowKey = Keyboard.sKeydown(doc, Keys.right(), { });
    const sPressTabKey = Keyboard.sKeydown(doc, Keys.tab(), { });

    // Assert focus is on the expected toolbar button
    const sAssertFocusOnItem = (label, selector) => {
      return FocusTools.sTryOnSelector(
        `Focus should be on: ${label}`,
        doc,
        selector
      );
    };

    const sClickOnToolbarButton = (selector) => {
      return Chain.asStep({}, [
        Chain.fromParent(tinyUi.cWaitForPopup('wait for context toolbar', '.tox-pop__dialog div'), [
          Chain.fromChains([
            UiFinder.cFindIn(selector),
            Mouse.cClick
          ])
        ])
      ]);
    };

    const sAssertHtmlStructure = (label, expectedHtml) => Chain.asStep({editor}, [ NamedChain.read('editor', Chain.op((editor) => {
      const elm = Replication.deep(Element.fromDom(editor.getBody()));
      Arr.each(SelectorFilter.descendants(elm, '*[data-mce-bogus="all"]'), Remove.remove);
      const actualHtml = Html.get(elm);
      Assertions.assertHtmlStructure(label, `<body>${expectedHtml}</body>`, `<body>${actualHtml}</body>`);
    }))]);

    const sOpenAndCloseDialog = GeneralSteps.sequence([
      Chain.asStep(editor, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        UiChains.cCloseDialog('div[role="dialog"]')
      ]),
      Waiter.sTryUntil('Wait for dialog to close', UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[role="dialog"]'), 50, 5000)
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'Table: context toolbar keyboard navigation test', [
        sAddTableAndOpenContextToolbar(tableHtml),
        sPressKeyboardShortcutKey,
        sAssertFocusOnItem('Table properties button', 'button[aria-label="Table properties"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Delete table button', 'button[aria-label="Delete table"]'),
        sPressTabKey,
        sAssertFocusOnItem('Insert row above button', 'button[aria-label="Insert row before"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Insert row below button', 'button[aria-label="Insert row after"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Delete row button', 'button[aria-label="Delete row"]'),
        sPressTabKey,
        sAssertFocusOnItem('Insert column before button', 'button[aria-label="Insert column before"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Insert column after button', 'button[aria-label="Insert column after"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Delete column button', 'button[aria-label="Delete column"]'),
        sPressTabKey,
        sAssertFocusOnItem('Table properties button', 'button[aria-label="Table properties"]'),
        sClickOnToolbarButton('button[aria-label="Delete table"]'),
        sAssertHtmlStructure('Assert delete table', '<p><br></p>')
      ]),
      Log.stepsAsStep('TBA', 'Table: context toolbar functionality test', [
        sAddTableAndOpenContextToolbar(tableHtml),

        sClickOnToolbarButton('button[aria-label="Table properties"]'),
        sOpenAndCloseDialog,

        sClickOnToolbarButton('button[aria-label="Insert row before"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert row after"]'),
        sAssertHtmlStructure('Assert insert row after', '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete row"]'),
        sAssertHtmlStructure('Assert delete row', '<table><tbody><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert column before"]'),
        sAssertHtmlStructure('Assert insert column before', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert column after"]'),
        sAssertHtmlStructure('Assert insert column after', '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete column"]'),
        sAssertHtmlStructure('Assert delete column', '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete table"]'),
        sAssertHtmlStructure('Assert remove table', '<p><br></p>')
      ]),
      Log.stepsAsStep('TBA', 'Table: context toolbar functionality test with focus in caption', [
        sAddTableAndOpenContextToolbar('<table style = "width: 5%;"><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0], 1),

        sClickOnToolbarButton('button[aria-label="Table properties"]'),
        sOpenAndCloseDialog,

        sClickOnToolbarButton('button[aria-label="Insert row before"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert row after"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete row"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert column before"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Insert column after"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete column"]'),
        sAssertHtmlStructure('Assert insert row before', '<table><caption>abc</caption><tbody><tr><td>x</td></tr></tbody></table>'),

        sClickOnToolbarButton('button[aria-label="Delete table"]'),
        sAssertHtmlStructure('Assert remove table', '<p><br></p>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
