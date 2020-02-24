import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  Guard,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Pipeline,
  UiFinder,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Menu } from '@ephox/bridge';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('OxideColorSwatchMenuTest', (success, failure) => {
  Theme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      const structColors = (values: string[]) => (s, str, arr) => {
        return Arr.map(values, (v) => structColor(v)(s, str, arr));
      };

      const structColor = (value: string) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-swatch') ],
          styles: {
            'background-color': str.is(value)
          }
        });
      };

      const sFocusOnColor = (expected: string) => Chain.asStep(doc, [
        FocusTools.cGetFocused,
        Assertions.cAssertStructure('Checking focus is on ' + expected, ApproxStructure.build((s, str, arr) => {
          return structColor(expected)(s, str, arr);
        }))
      ]);

      Pipeline.async({ }, Logger.ts(
        'Check structure of color swatch',
        [
          // Give a visual indication of focus
          TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { transform: scale(0.8) }'
          ]),

          Mouse.sClickOn(Body.body(), '.tox-split-button__chevron'),
          Chain.asStep(Body.body(), [
            Chain.control(
              UiFinder.cFindIn('[role="menu"]'),
              Guard.tryUntil('Waiting for menu')
            ),
            Assertions.cAssertStructure(
              'Checking menu structure for color swatches',
              ApproxStructure.build((s, str, arr) => {
                return s.element('div', {
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
                });
              })
            )
          ]),

          sFocusOnColor('green'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          sFocusOnColor('blue'),
          Keyboard.sKeydown(doc, Keys.right(), { }),
          sFocusOnColor('black'),

          TestHelpers.GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
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
            ], (c) => ({ type: 'choiceitem', text: c, value: c } as Menu.ChoiceMenuItemApi));
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
    },
    () => {
      success();
    },
    failure
  );
});
