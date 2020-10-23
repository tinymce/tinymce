import { ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideListCollectionMenuTest', (success, failure) => {
  Theme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const doc = SugarElement.fromDom(document);

      Pipeline.async({ }, Logger.ts(
        'Check structure of list collection',
        [
          TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }'
          ]),
          tinyUi.sClickOnToolbar('Click on toolbar button', 'button'),
          UiFinder.sWaitForVisible('Waiting for menu', SugarBody.body(), '[role="menu"]'),
          Chain.asStep(SugarBody.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => s.element('div', {
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
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-collection__item-checkmark') ],
                            children: [
                              s.element('svg', {})
                            ]
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
              }))
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
              } as Menu.ToggleMenuItemSpec,
              {
                type: 'nestedmenuitem',
                text: 'Beta',
                icon: 'fake-icon-name',
                getSubmenuItems: () => [
                  {
                    type: 'menuitem',
                    text: 'Beta-1'
                  }
                ]
              } as Menu.NestedMenuItemSpec,
              {
                type: 'separator'
              },
              {
                type: 'menuitem',
                text: 'Gamma',
                shortcut: 'Ctrl+C',
                icon: 'fake-icon-name'
              } as Menu.MenuItemSpec
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
