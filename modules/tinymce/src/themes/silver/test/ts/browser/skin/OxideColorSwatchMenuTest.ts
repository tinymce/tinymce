import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.skin.OxideColorSwatchMenuTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'swatch-button forecolor',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addSplitButton('swatch-button', {
        type: 'splitbutton',
        presets: 'color',
        columns: 2,
        tooltip: 'swatch-button',
        fetch: (callback) => {
          const items = Arr.map([
            'green',
            'red',
            'blue',
            'black',
            'white'
          ], (c): Menu.ChoiceMenuItemSpec => ({ type: 'choiceitem', text: c, value: c }));
          callback(items.concat([
            {
              type: 'choiceitem',
              text: 'Remove',
              icon: 'fake-icon-name',
              value: 'remove'
            },
            {
              type: 'choiceitem',
              text: 'Custom',
              icon: 'fake-icon-name',
              value: 'custom'
            }
          ]));
        },
        onAction: store.adder('onAction'),
        onItemAction: store.adder('onItemAction')
      });
    }
  }, []);

  const structColor = (value: string): ApproxStructure.Builder<StructAssert> =>
    (s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-swatch') ],
      styles: {
        'background-color': str.is(value)
      }
    });

  const structColors = (values: string[]): ApproxStructure.Builder<StructAssert[]> =>
    (s, str, arr) => Arr.map(values, (v) => structColor(v)(s, str, arr));

  const assertFocusIsOnColor = (expected: string) => {
    const focused = FocusTools.getFocused(SugarDocument.getDocument()).getOrDie();
    Assertions.assertStructure(
      'Checking focus is on ' + expected,
      ApproxStructure.build((s, str, arr) => structColor(expected)(s, str, arr)),
      focused
    );
  };

  const openAndGetMenu = (title: string) =>
    () => {
      Mouse.clickOn(SugarBody.body(), `[title="${title}"] .tox-split-button__chevron`);
      return Waiter.pTryUntil('Waiting for menu', () =>
        UiFinder.findIn(SugarBody.body(), '[role="menu"]').getOrDie()
      );
    };

  const closeMenu = (title: string) =>
    () => {
      Mouse.clickOn(SugarBody.body(), `[title="${title}"] .tox-split-button__chevron`);
      return Waiter.pTryUntil('Waiting for menu', () =>
        UiFinder.notExists(SugarBody.body(), '[role="menu"]')
      );
    };

  const openAndGetSwatchButtonMenu = openAndGetMenu('swatch-button');
  const closeSwatchButtonMenu = closeMenu('swatch-button');
  const openAndGetForecolorMenu = openAndGetMenu('Text color');
  const closeForecolorMenu = closeMenu('Text color');

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    ':focus { transform: scale(0.8) }'
  ]);

  it('Check structure of color swatch', async () => {
    const editor = hook.editor();
    const menu = await openAndGetSwatchButtonMenu();
    Assertions.assertStructure(
      'Checking menu structure for color swatches',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-swatches') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-swatches__row') ],
                children: structColors([ 'green', 'red' ])(s, str, arr)
              }),
              s.element('div', {
                classes: [ arr.has('tox-swatches__row') ],
                children: structColors([ 'blue', 'black' ])(s, str, arr)
              }),
              s.element('div', {
                classes: [ arr.has('tox-swatches__row') ],
                children: (structColors([ 'white' ])(s, str, arr)).concat([
                  s.element('div', {
                    classes: [ arr.has('tox-swatch'), arr.has('tox-swatch--remove') ],
                    children: [
                      s.element('svg', {})
                    ]
                  })
                ])
              }),
              s.element('div', {
                classes: [ arr.has('tox-swatches__row') ],
                children: [
                  s.element('button', {
                    classes: [ arr.has('tox-swatch'), arr.has('tox-swatches__picker-btn') ],
                    children: [
                      s.element('svg', {})
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      menu
    );

    assertFocusIsOnColor('green');
    TinyUiActions.keydown(editor, Keys.down());
    assertFocusIsOnColor('blue');
    TinyUiActions.keydown(editor, Keys.right());
    assertFocusIsOnColor('black');
    closeSwatchButtonMenu();
  });

  it('TINY-9283: selected color is successfully marked', async () => {
    const editor = hook.editor();
    editor.setContent('<p>black</p><p style="color: rgb(224, 62, 45);">red</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2, true);

    await openAndGetForecolorMenu();
    assertFocusIsOnColor('rgb(0, 0, 0)');
    closeForecolorMenu();

    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 2, true);

    await openAndGetForecolorMenu();
    assertFocusIsOnColor('rgb(224, 62, 45)');
    closeForecolorMenu();
  });
});
