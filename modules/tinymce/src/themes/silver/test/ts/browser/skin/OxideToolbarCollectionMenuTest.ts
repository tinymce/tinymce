import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, TestStore } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.skin.OxideToolbarCollectionMenuTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
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
            }))
          );
        },
        onAction: store.adder('onAction'),
        onItemAction: store.adder('onItemAction')
      });
    }
  }, []);

  it('Check structure of toolbar collection', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    Mouse.clickOn(SugarBody.body(), '.tox-split-button__chevron');
    const menu = await TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
    Assertions.assertStructure(
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
      })),
      menu
    );

    await FocusTools.pTryOnSelector('Focus should start on A', doc, '.tox-collection__item[title="A-button"]');
    TinyUiActions.keydown(editor, Keys.down());
    await FocusTools.pTryOnSelector('Focus should move to D', doc, '.tox-collection__item[title="D-button"]');
    TinyUiActions.keydown(editor, Keys.right());
    await FocusTools.pTryOnSelector('Focus should move to E', doc, '.tox-collection__item[title="E-button"]');
  });
});
