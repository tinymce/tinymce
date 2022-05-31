import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as MenuUtils from '../../../module/MenuUtils';

describe('browser.tinymce.themes.silver.editor.bespoke.SilverBespokeButtonsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'align fontfamily fontsize blocks styles',
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/src/themes/silver/test/css/content.css'
  }, []);

  const pAssertFocusOnItem = (itemText: string) => FocusTools.pTryOnSelector(
    `Focus should be on ${itemText}`,
    SugarDocument.getDocument(),
    `.tox-collection__item:contains("${itemText}")`
  );

  const pAssertFocusOnToolbarButton = (buttonText: string) => FocusTools.pTryOnSelector(
    `Focus should be on ${buttonText}`,
    SugarDocument.getDocument(),
    `.tox-toolbar__group button:contains("${buttonText}")`
  );

  const pAssertFocusOnAlignToolbarButton = () => FocusTools.pTryOnSelector(
    'Focus should be on Align',
    SugarDocument.getDocument(),
    '.tox-toolbar__group button[aria-label="Align"]'
  );

  const assertItemTicks = (label: string, expectedTicks: boolean[]) => {
    const group = UiFinder.findIn(SugarBody.body(), '.tox-selected-menu .tox-collection__group').getOrDie();
    Assertions.assertStructure(label, ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-collection__group') ],
      children: Arr.map(expectedTicks, (expected) => s.element('div', {
        attrs: {
          'role': str.is('menuitemcheckbox'),
          'aria-checked': str.is(expected ? 'true' : 'false')
        }
      }))
    })), group);
  };

  const pCheckItemsAtLocationPlus = (pBeforeStep: () => Promise<void>, pAfterStep: () => Promise<void>, pOpen: (text: string) => Promise<void>) =>
    async (label: string, editor: Editor, expectedTicks: boolean[], menuText: string, path: number[], offset: number) => {
      TinySelections.setCursor(editor, path, offset);
      await pOpen(menuText);
      await pBeforeStep();
      assertItemTicks(label, expectedTicks);
      await pAfterStep();
      TinyUiActions.keyup(editor, Keys.escape());
      UiFinder.notExists(SugarBody.body(), '[role="menu"]');
    };

  const pNoop = () => Promise.resolve();
  const pCheckItemsAtLocation = pCheckItemsAtLocationPlus(pNoop, pNoop, (text) => MenuUtils.pOpenMenu('', text));
  const pCheckAlignItemsAtLocation = pCheckItemsAtLocationPlus(pNoop, pNoop, () => MenuUtils.pOpenAlignMenu(''));

  const pCheckSubItemsAtLocation = (expectedSubmenu: string) => pCheckItemsAtLocationPlus(
    async () => {
      Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.right());
      await pAssertFocusOnItem(expectedSubmenu);
    },
    // Afterwards, escape the submenu
    () => {
      Keyboard.activeKeyup(SugarDocument.getDocument(), Keys.escape());
      return Promise.resolve();
    },
    (text) => MenuUtils.pOpenMenu('', text)
  );

  it('TBA: Checking alignment ticks and updating', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenAlignMenu('Align');
    await pAssertFocusOnItem('Left');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Center');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');

    await pCheckAlignItemsAtLocation(
      'First paragraph after "centering"',
      editor,
      [ false, true, false, false ],
      'Center',
      [ 0, 0 ], 'Fi'.length
    );

    await pCheckAlignItemsAtLocation(
      'Second paragraph with no set alignment',
      editor,
      [ false, false, false, false ],
      'Align',
      [ 1, 0 ], 'Se'.length
    );

    await pCheckAlignItemsAtLocation(
      'First paragraph with the alignment set to "center" previously',
      editor,
      [ false, true, false, false ],
      'Center',
      [ 0, 0 ], 'Fi'.length
    );
  });

  it('TBA: Checking fontfamily ticks and updating', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenMenu('FontSelect', 'Verdana');
    await pAssertFocusOnItem('Andale Mono');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');

    await pCheckItemsAtLocation(
      'First paragraph after "Andale Mono"',
      editor,
      [ true ].concat(Arr.range(16, Fun.never)),
      'Andale Mono',
      [ 0, 0, 0 ], 'Fi'.length
    );

    await pCheckItemsAtLocation(
      'Second paragraph with no set font',
      editor,
      Arr.range<boolean>(14, Fun.never).concat([ true ]).concat(Arr.range(2, Fun.never)),
      'Verdana',
      [ 1, 0 ], 'Se'.length
    );

    await pCheckItemsAtLocation(
      'First paragraph with the font set to "Andale Mono" previously',
      editor,
      [ true ].concat(Arr.range(16, Fun.never)),
      'Andale Mono',
      [ 0, 0, 0 ], 'Fi'.length
    );
  });

  it('TBA: Checking fontsize ticks and updating', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenMenu('FontSelect', '12pt'); // This might be fragile.
    await pAssertFocusOnItem('8pt');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');

    await pCheckItemsAtLocation(
      'First paragraph after "8pt',
      editor,
      [ true ].concat(Arr.range(6, Fun.never)),
      '8pt',
      [ 0, 0, 0 ], 'Fi'.length
    );

    await pCheckItemsAtLocation(
      'Second paragraph with no set font size',
      editor,
      Arr.range<boolean>(2, Fun.never).concat([ true ]).concat(Arr.range(4, Fun.never)),
      '12pt',
      [ 1, 0 ], 'Se'.length
    );

    await pCheckItemsAtLocation(
      'First paragraph with the font set to "8pt" previously',
      editor,
      [ true ].concat(Arr.range(6, Fun.never)),
      '8pt',
      [ 0, 0, 0 ], 'Fi'.length
    );
  });

  it('TBA: Checking format ticks and updating', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenMenu('Format', 'Paragraph:first');
    await pAssertFocusOnItem('Paragraph');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Heading 1');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');

    await pCheckItemsAtLocation(
      'First block after "h1',
      editor,
      [ false, true ].concat(Arr.range(6, Fun.never)),
      'Heading 1:first',
      [ 0, 0 ], 'Fi'.length
    );

    await pCheckItemsAtLocation(
      'Second paragraph with no set format',
      editor,
      [ true ].concat(Arr.range(7, Fun.never)),
      'Paragraph:first',
      [ 1, 0 ], 'Se'.length
    );

    await pCheckItemsAtLocation(
      'First block with the "h1" set previously',
      editor,
      [ false, true ].concat(Arr.range(6, Fun.never)),
      'Heading 1:first',
      [ 0, 0 ], 'Fi'.length
    );

    // Check that the menus are working also
    Mouse.clickOn(SugarBody.body(), '[role="menubar"] [role="menuitem"]:contains("Format")');
    await pAssertFocusOnItem('Bold');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Italic');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Underline');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Strikethrough');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Superscript');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Subscript');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Code');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Formats');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Blocks');
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnItem('Paragraph');
    assertItemTicks('Checking blocks in menu', [ false, true ].concat(Arr.range(6, Fun.never)));
    TinyUiActions.keyup(editor, Keys.escape());
    TinyUiActions.keyup(editor, Keys.escape());
  });

  it('TBA: Checking style ticks and updating', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenMenu('Format', 'Paragraph:last');
    await pAssertFocusOnItem('Headings');
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnItem('Heading 1');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');

    await pCheckSubItemsAtLocation('Heading 1')(
      'First block after "h1',
      editor,
      [ true ].concat(Arr.range(5, Fun.never)),
      'Heading 1:last',
      [ 0, 0 ], 'Fi'.length
    );

    await pCheckSubItemsAtLocation('Heading 1')(
      'Second paragraph with no set format',
      editor,
      Arr.range(6, Fun.never),
      'Paragraph:last',
      [ 1, 0 ], 'Se'.length
    );

    await pCheckSubItemsAtLocation('Heading 1')(
      'First block with the "h1" set previously',
      editor,
      [ true ].concat(Arr.range(5, Fun.never)),
      'Heading 1:last',
      [ 0, 0 ], 'Fi'.length
    );

    // Check that the menus are working also
    Mouse.clickOn(SugarBody.body(), '[role="menubar"] [role="menuitem"]:contains("Format")');
    await pAssertFocusOnItem('Bold');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Italic');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Underline');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Strikethrough');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Superscript');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Subscript');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Code');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Formats');
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnItem('Headings');
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnItem('Heading 1');
    assertItemTicks('Checking headings in menu', [ true ].concat(Arr.range(5, Fun.never)));
    TinyUiActions.keyup(editor, Keys.escape());
    TinyUiActions.keyup(editor, Keys.escape());
    TinyUiActions.keyup(editor, Keys.escape());
  });

  it('TBA: Checking toolbar keyboard navigation', async () => {
    const editor = hook.editor();
    editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
    await MenuUtils.pOpenAlignMenu('Align');
    await pAssertFocusOnItem('Left');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Center');

    // Check moving left and right closes the open dropdown and navigates to the next item
    TinyUiActions.keydown(editor, Keys.right());
    await pAssertFocusOnToolbarButton('Verdana'); // Font Select
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');
    TinyUiActions.keydown(editor, Keys.down());
    await pAssertFocusOnItem('Andale Mono');
    TinyUiActions.keydown(editor, Keys.left());
    await pAssertFocusOnAlignToolbarButton(); // Alignment
    UiFinder.notExists(SugarBody.body(), '[role="menu"]');
  });
});
