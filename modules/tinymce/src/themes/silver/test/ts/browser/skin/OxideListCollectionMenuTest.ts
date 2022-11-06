import { ApproxStructure, Assertions, FocusTools, Keys, TestStore } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.skin.OxideListCollectionMenuTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
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
            }, {
              type: 'nestedmenuitem',
              text: 'Beta',
              icon: 'fake-icon-name',
              getSubmenuItems: () => [
                {
                  type: 'menuitem',
                  text: 'Beta-1'
                }
              ]
            }, {
              type: 'separator'
            }, {
              type: 'menuitem',
              text: 'Gamma',
              shortcut: 'Ctrl+C',
              icon: 'fake-icon-name'
            }
          ]);
        }
      });
    }
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    ':focus { background-color: rgb(222, 224, 226); }'
  ]);

  it('Check structure of list collection', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    TinyUiActions.clickOnToolbar(editor, 'button');
    const menu = await TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
    Assertions.assertStructure(
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
      })),
      menu
    );

    await FocusTools.pTryOnSelector('Focus should be on Alpha', doc, '.tox-collection__item:contains(Alpha)');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should be on Beta', doc, '.tox-collection__item:contains(Beta)');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should be on Gamma', doc, '.tox-collection__item:contains(Gamma)');
  });
});
