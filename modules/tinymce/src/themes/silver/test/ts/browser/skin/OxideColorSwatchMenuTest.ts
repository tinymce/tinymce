import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.skin.OxideColorSwatchMenuTest', () => {
  const store = TestHelpers.TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'swatch-button',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addSplitButton('swatch-button', {
        type: 'splitbutton',
        presets: 'color',
        columns: 2,
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
  }, [ Theme ]);

  const structColor = (value: string): ApproxStructure.Builder<StructAssert> =>
    (s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-swatch') ],
      styles: {
        'background-color': str.is(value)
      }
    });

  const structColors = (values: string[]): ApproxStructure.Builder<StructAssert[]> =>
    (s, str, arr) => Arr.map(values, (v) => structColor(v)(s, str, arr));

  const focusOnColor = (expected: string) => {
    const focused = FocusTools.getFocused(SugarDocument.getDocument()).getOrDie();
    Assertions.assertStructure(
      'Checking focus is on ' + expected,
      ApproxStructure.build((s, str, arr) => structColor(expected)(s, str, arr)),
      focused
    );
  };

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    ':focus { transform: scale(0.8) }'
  ]);

  it('Check structure of color swatch', async () => {
    const editor = hook.editor();
    Mouse.clickOn(SugarBody.body(), '.tox-split-button__chevron');
    const menu = await Waiter.pTryUntil('Waiting for menu', () =>
      UiFinder.findIn(SugarBody.body(), '[role="menu"]').getOrDie()
    );
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

    focusOnColor('green');
    TinyUiActions.keydown(editor, Keys.down());
    focusOnColor('blue');
    TinyUiActions.keydown(editor, Keys.right());
    focusOnColor('black');
  });
});
