import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import { pOpenContextMenu, pWaitForAndCloseDialog } from '../../../module/ContextMenuUtils';

describe('browser.tinymce.themes.silver.editor.contextmenu.DesktopContextMenuTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image link table',
    toolbar: 'image editimage link table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ ImagePlugin, LinkPlugin, TablePlugin ], true);

  // Assert focus is on the expected menu item
  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pressDownArrowKey = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.down());
  const pressEnterKey = () => Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.enter());
  const repeatDownArrowKey = (index: number) => Arr.range(index, pressDownArrowKey);

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

  it('TBA: Test context menus on empty editor', async () => {
    const editor = hook.editor();
    await pOpenContextMenu(editor, 'p');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
  });

  it('TBA: Test context menus on a link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/">Tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Ti'.length);
    await pOpenContextMenu(editor, 'a');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Remove Link', '.tox-collection__item:contains("Remove link")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
    await pOpenContextMenu(editor, 'a');
    pressDownArrowKey();
    pressEnterKey();
    assertRemoveLinkHtmlStructure(editor);
  });

  it('TBA: Test context menus on a table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    await pOpenContextMenu(editor, 'td');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")');
    pressDownArrowKey();
    pAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")');
    pressDownArrowKey();
    pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey();
    pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.up());
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
  });

  it('TBA: Test context menus on image inside a table', async () => {
    const editor = hook.editor();
    editor.setContent(imageInTableHtml);
    await pOpenContextMenu(editor, 'img');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Image', '.tox-collection__item:contains("Image")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
    // Navigate back to the "Image"" menu item
    repeatDownArrowKey(2);
    pressEnterKey();
    await pWaitForAndCloseDialog(editor);
  });

  it('TBA: Test context menus on link inside a table', async () => {
    const editor = hook.editor();
    editor.setContent(linkInTableHtml);
    await pOpenContextMenu(editor, 'a');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Remove Link', '.tox-collection__item:contains("Remove link")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Open Link', '.tox-collection__item:contains("Open link")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
  });

  it('TBA: Test context menus on placeholder image inside a table', async () => {
    const editor = hook.editor();
    // Placeholder images shouldn't show the image/image tools options
    editor.setContent(placeholderImageInTableHtml);
    TinySelections.select(editor, 'img', []);
    await pOpenContextMenu(editor, 'img');
    await pAssertFocusOnItem('Link', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Cell', '.tox-collection__item:contains("Cell")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Row', '.tox-collection__item:contains("Row")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Column', '.tox-collection__item:contains("Column")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Table Properties', '.tox-collection__item:contains("Table properties")');
    pressDownArrowKey();
    await pAssertFocusOnItem('Delete Table', '.tox-collection__item:contains("Delete table")');
  });
});
