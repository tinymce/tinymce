import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

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
    '.tox-toolbar__group button[aria-label^="Align"].tox-tbtn--select'
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

  let eventCount = 0;
  let lastEventValue = '';
  const testWithEvents = (eventName: string, testFn: (editor: Editor) => Promise<void>) => async () => {
    const eventTester = (e: EditorEvent<{ value: string }>) => {
      eventCount++;
      lastEventValue = e.value;
    };

    eventCount = 0;
    lastEventValue = '';
    const editor = hook.editor();
    editor.on(eventName, eventTester);
    await testFn(editor);
    editor.off(eventName, eventTester);
  };

  const assertNoEvent = () => {
    assert.equal(eventCount, 0);
    assert.equal(lastEventValue, '');
  };

  const assertEvent = (count: number, value: string) => {
    assert.equal(eventCount, count);
    assert.equal(lastEventValue, value);
  };

  it('TBA: Checking alignment ticks and updating',
    testWithEvents('AlignTextUpdate', async (editor) => {
      editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
      assertNoEvent();
      TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
      assertEvent(1, 'left');
      await MenuUtils.pOpenAlignMenu('Align');
      assertEvent(2, 'left');
      await pAssertFocusOnItem('Left');
      TinyUiActions.keydown(editor, Keys.down());
      await pAssertFocusOnItem('Center');
      assertEvent(2, 'left');
      TinyUiActions.keydown(editor, Keys.enter());
      assertEvent(8, 'center');
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
    }));

  it('TBA: Checking fontfamily ticks and updating',
    testWithEvents('FontFamilyTextUpdate', async (editor) => {
      editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
      assertNoEvent();
      TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
      assertEvent(1, 'Verdana');
      await MenuUtils.pOpenMenu('FontSelect', 'Verdana');
      assertEvent(2, 'Verdana');
      await pAssertFocusOnItem('Andale Mono');
      assertEvent(2, 'Verdana');
      TinyUiActions.keydown(editor, Keys.enter());
      assertEvent(4, 'Andale Mono');
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
    }));

  it('TBA: Checking fontsize ticks and updating',
    testWithEvents('FontSizeTextUpdate', async (editor) => {
      editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
      assertNoEvent();
      TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
      assertEvent(1, '12pt');
      await MenuUtils.pOpenMenu('FontSelect', '12pt'); // This might be fragile.
      assertEvent(2, '12pt');
      await pAssertFocusOnItem('8pt');
      assertEvent(2, '12pt');
      TinyUiActions.keydown(editor, Keys.enter());
      assertEvent(4, '8pt');
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
    }));

  it('TBA: Checking format ticks and updating',
    testWithEvents('BlocksTextUpdate', async (editor) => {
      editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
      assertNoEvent();
      TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
      assertEvent(1, 'Paragraph');
      await MenuUtils.pOpenMenu('Format', 'Paragraph:first');
      assertEvent(2, 'Paragraph');
      await pAssertFocusOnItem('Paragraph');
      TinyUiActions.keydown(editor, Keys.down());
      await pAssertFocusOnItem('Heading 1');
      assertEvent(2, 'Paragraph');
      TinyUiActions.keydown(editor, Keys.enter());
      assertEvent(5, 'Heading 1');
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
      await pAssertFocusOnItem('Format');
      TinyUiActions.keydown(editor, Keys.down());
      await pAssertFocusOnItem('Block');
      TinyUiActions.keydown(editor, Keys.right());
      await pAssertFocusOnItem('Paragraph');
      assertItemTicks('Checking blocks in menu', [ false, true ].concat(Arr.range(6, Fun.never)));
      TinyUiActions.keyup(editor, Keys.escape());
      TinyUiActions.keyup(editor, Keys.escape());
    }));

  it('TBA: Checking style ticks and updating',
    testWithEvents('StylesTextUpdate', async (editor) => {
      editor.setContent('<p>First paragraph</p><p>Second paragraph</p>');
      assertNoEvent();
      TinySelections.setCursor(editor, [ 0, 0 ], 'Fi'.length);
      assertEvent(1, 'Paragraph');
      await MenuUtils.pOpenMenu('Format', 'Paragraph:last');
      assertEvent(2, 'Paragraph');
      await pAssertFocusOnItem('Headings');
      TinyUiActions.keydown(editor, Keys.right());
      await pAssertFocusOnItem('Heading 1');
      assertEvent(2, 'Paragraph');
      TinyUiActions.keydown(editor, Keys.enter());
      assertEvent(4, 'Heading 1');
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
      await pAssertFocusOnItem('Format');
      TinyUiActions.keydown(editor, Keys.right());
      await pAssertFocusOnItem('Headings');
      TinyUiActions.keydown(editor, Keys.right());
      await pAssertFocusOnItem('Heading 1');
      assertItemTicks('Checking headings in menu', [ true ].concat(Arr.range(5, Fun.never)));
      TinyUiActions.keyup(editor, Keys.escape());
      TinyUiActions.keyup(editor, Keys.escape());
      TinyUiActions.keyup(editor, Keys.escape());
    }));

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

  context('Noneditable root', () => {
    const testDisableOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"]:disabled`);
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"]:not(:disabled)`);
      });
    };

    it('TINY-9669: Disable align on noneditable content', testDisableOnNoneditable('Align'));
    it('TINY-9669: Disable fontfamily on noneditable content', testDisableOnNoneditable('Font'));
    it('TINY-9669: Disable fontsize on noneditable content', testDisableOnNoneditable('Font size'));
    it('TINY-9669: Disable blocks on noneditable content', testDisableOnNoneditable('Block'));
    it('TINY-9669: Disable styles on noneditable content', testDisableOnNoneditable('Format'));
  });
});
