import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Touch, UiFinder, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import { pWaitForAndCloseDialog } from '../../../module/ContextMenuUtils';

describe('browser.tinymce.themes.silver.editor.contextmenu.MobileContextMenuTest', () => {
  const detection = PlatformDetection.detect();

  before(function () {
    const browser = detection.browser;
    const runTests = browser.isChromium() || browser.isFirefox() || browser.isSafari();
    if (!runTests) {
      this.skip();
    }

    // Override the platform detection, so that it thinks we're on a touch device
    PlatformDetection.override({
      deviceType: {
        ...detection.deviceType,
        isTouch: Fun.always
      }
    });
  });

  after(() => {
    PlatformDetection.override(detection);
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image link table',
    toolbar: 'image editimage link table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ ImagePlugin, LinkPlugin, TablePlugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    const targetElem = UiFinder.findIn(TinyDom.body(editor), target).getOrDie();
    Touch.touchStart(targetElem);
    await Waiter.pWait(500);
    editor.dispatch('selectionchange');
    Touch.touchEnd(targetElem);
    await Waiter.pWait(100);
    await TinyUiActions.pWaitForPopup(editor, '.tox-silver-sink .tox-collection--horizontal [role="menuitem"]');
  };

  const pressDownArrowKey = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
  const pressEnterKey = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.enter());
  const pressEscKey = () => Keyboard.activeKeyup(SugarDocument.getDocument(), Keys.escape());

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
  const assertRemoveLinkHtmlStructure = (editor: Editor) => Assertions.assertStructure('Assert remove link',
    ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.text(str.is('Tiny')),
            s.zeroOrOne(s.element('br', {}))
          ]
        })
      ]
    })), TinyDom.body(editor)
  );

  const assertMenuItems = (items: string[]) => {
    const contextMenu = UiFinder.findIn(SugarBody.body(), mobileContextMenuSelector).getOrDie();
    Arr.each(items, (item) => UiFinder.exists(contextMenu, item));
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

  it('TBA: Test context menus on empty editor', async () => {
    const editor = hook.editor();
    await pOpenContextMenu(editor, 'p');
    assertMenuItems([ selectors.link ]);
    pressEscKey();
  });

  it('TBA: Test context menus on a link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/">Tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Ti'.length);
    await pOpenContextMenu(editor, 'a');
    assertMenuItems([
      selectors.link,
      selectors.removelink,
      selectors.openlink
    ]);
    pressEscKey();
    await pOpenContextMenu(editor, 'a');
    FocusTools.setFocus(SugarBody.body(), selectors.link);
    pressDownArrowKey();
    pressEnterKey();
    assertRemoveLinkHtmlStructure(editor);
  });

  it('TBA: Test context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pOpenContextMenu(editor, 'td');
    assertMenuItems([
      selectors.link,
      selectors.cell,
      selectors.row,
      selectors.column,
      selectors.tableprops,
      selectors.deletetable
    ]);
    FocusTools.setFocus(SugarBody.body(), selectors.tableprops);
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
  });

  it('TBA: Test context menus on image inside a table', async () => {
    const editor = hook.editor();
    editor.setContent(imageInTableHtml);
    await pOpenContextMenu(editor, 'img');
    assertMenuItems([
      selectors.link,
      selectors.image,
      selectors.cell,
      selectors.row,
      selectors.column,
      selectors.tableprops,
      selectors.deletetable
    ]);
    FocusTools.setFocus(SugarBody.body(), selectors.image);
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
  });

  it('TBA: Test context menus on link inside a table', async () => {
    const editor = hook.editor();
    editor.setContent(linkInTableHtml);
    await pOpenContextMenu(editor, 'a');
    assertMenuItems([
      selectors.link,
      selectors.removelink,
      selectors.openlink,
      selectors.cell,
      selectors.row,
      selectors.column,
      selectors.tableprops,
      selectors.deletetable
    ]);
  });

  it('TBA: Test context menus on placeholder image inside a table', async () => {
    const editor = hook.editor();
    // Placeholder images shouldn't show the image/image tools options
    editor.setContent(placeholderImageInTableHtml);
    TinySelections.select(editor, 'img', []);
    await pOpenContextMenu(editor, 'img');
    assertMenuItems([
      selectors.link,
      selectors.cell,
      selectors.row,
      selectors.column,
      selectors.tableprops,
      selectors.deletetable
    ]);
  });
});
