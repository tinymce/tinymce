import { ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Menu } from '@ephox/bridge';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideToolbarCollectionMenuTest', (success, failure) => {
  Theme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      Pipeline.async({ }, Logger.ts(
        'Check structure of toolbar collection',
        [
          Mouse.sClickOn(Body.body(), '.tox-split-button__chevron'),
          UiFinder.sWaitForVisible('Waiting for menu', Body.body(), '[role="menu"]'),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking menu structure',
              ApproxStructure.build((s, str, arr) => s.element('div', {
                classes: [
                  arr.has('tox-menu'),
                  arr.has('tox-collection'),
                  arr.has('tox-collection--toolbar'),
                  arr.has('tox-collection--toolbar-lg')
                ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('A-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('B-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('C-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('D-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('E-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item'), arr.not('tox-tbtn') ],
                        attrs: {
                          title: str.is('F-button')
                        },
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-icon') ],
                            children: [
                              s.element('svg', {})
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              }))
            )
          ]),
          FocusTools.sTryOnSelector('Focus should start on A', doc, '.tox-collection__item[title="A-button"]'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should move to D', doc, '.tox-collection__item[title="D-button"]'),
          Keyboard.sKeydown(doc, Keys.right(), { }),
          FocusTools.sTryOnSelector('Focus should move to E', doc, '.tox-collection__item[title="E-button"]')
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'toolbar-collection',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addSplitButton('toolbar-collection', {
          type: 'splitbutton',
          columns: 3,
          presets: 'listpreview',
          fetch: (callback) => {
            callback(
              Arr.map([ 'A', 'B', 'C', 'D', 'E', 'F' ], (letter) => ({
                type: 'choiceitem',
                value: `${letter}`,
                icon: 'fake-icon-name',
                text: `${letter}-button`,
                onAction: store.adder(`${letter}-onAction`)
              } as Menu.ChoiceMenuItemApi))
            );
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
