import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Pipeline,
  UiFinder,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from '../../../../../silver/main/ts/Theme';
import { GuiSetup, TestStore } from '../../module/AlloyTestUtils';

UnitTest.asynctest('OxideListCollectionMenuTest', (success, failure) => {
  Theme();

  const store = TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      Pipeline.async({ }, Logger.ts(
        'Check structure of list collection',
        [
          GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }'
          ]),
          Mouse.sClickOn(Body.body(), '.tox-toolbar button'),
          UiFinder.sWaitForVisible('Waiting for menu', Body.body(), '[role="menu"]'),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => {
                return s.element('div', {
                  classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-collection__group') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-icon'), arr.has('tox-collection__item-checkmark') ],
                              // html: str.is('A')
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-accessory') ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-icon') ],
                              html: str.is('B')
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-caret') ]
                            })
                          ]
                        })
                      ]
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-collection__group') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          children: [
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-icon') ],
                              html: str.is('C')
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('span', {
                              classes: [ arr.has('tox-collection__item-accessory') ]
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
          FocusTools.sTryOnSelector('Focus should be on Alpha', doc, '.tox-collection__item:contains(Alpha)'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should be on Beta', doc, '.tox-collection__item:contains(Beta)'),
          Keyboard.sKeydown(doc, Keys.down(), { }),
          FocusTools.sTryOnSelector('Focus should be on Gamma', doc, '.tox-collection__item:contains(Gamma)'),
          GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'list-button',
      skin_url: '/project/js/tinymce/skins/oxide',
      setup: (ed) => {
        ed.ui.registry.addMenuButton('list-button', {
          type: 'menubutton',
          fetch: (callback) => {
            callback([
              {
                type: 'togglemenuitem',
                text: 'Alpha',
                active: true,
                shortcut: 'Ctrl+A',
                icon: 'A',
                onAction: store.adder('togglemenuitem.onAction')
              },
              {
                type: 'menuitem',
                text: 'Beta',
                icon: 'B',
                getSubmenuItems: () => {
                  return [
                    {
                      type: 'menuitem',
                      text: 'Beta-1'
                    }
                  ];
                }
              },
              {
                type: 'separator'
              },
              {
                type: 'menuitem',
                text: 'Gamma',
                shortcut: 'Ctrl+C',
                icon: 'C'
              },
            ]);
          }
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});