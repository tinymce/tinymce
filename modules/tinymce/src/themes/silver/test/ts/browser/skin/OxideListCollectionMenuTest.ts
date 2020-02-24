import { ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { Menu } from '@ephox/bridge';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('OxideListCollectionMenuTest', (success, failure) => {
  Theme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const doc = Element.fromDom(document);

      Pipeline.async({ }, Logger.ts(
        'Check structure of list collection',
        [
          TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }'
          ]),
          tinyUi.sClickOnToolbar('Click on toolbar button', 'button'),
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
                          attrs: {
                            title: str.is('Alpha')
                          },
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-icon'), arr.has('tox-collection__item-checkmark') ],
                              children: [
                                s.element('svg', {})
                              ]
                            }),
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-accessory') ]
                            })
                          ]
                        }),
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item') ],
                          attrs: {
                            title: str.is('Beta')
                          },
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-icon') ],
                              children: [
                                s.element('svg', {})
                              ]
                            }),
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('div', {
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
                          attrs: {
                            title: str.is('Gamma')
                          },
                          children: [
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-icon') ],
                              children: [
                                s.element('svg', {})
                              ]
                            }),
                            s.element('div', {
                              classes: [ arr.has('tox-collection__item-label') ]
                            }),
                            s.element('div', {
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
          TestHelpers.GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'list-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addMenuButton('list-button', {
          type: 'menubutton',
          fetch: (callback) => {
            callback([
              {
                type: 'togglemenuitem',
                text: 'Alpha',
                active: true,
                shortcut: 'Ctrl+A',
                icon: 'fake-icon-name',
                onAction: store.adder('togglemenuitem.onAction')
              } as Menu.ToggleMenuItemApi,
              {
                type: 'nestedmenuitem',
                text: 'Beta',
                icon: 'fake-icon-name',
                getSubmenuItems: () => {
                  return [
                    {
                      type: 'menuitem',
                      text: 'Beta-1'
                    }
                  ];
                }
              } as Menu.NestedMenuItemApi,
              {
                type: 'separator'
              },
              {
                type: 'menuitem',
                text: 'Gamma',
                shortcut: 'Ctrl+C',
                icon: 'fake-icon-name'
              } as Menu.MenuItemApi,
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
