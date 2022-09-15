import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, TestStore } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.skin.OxideGridCollectionMenuTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetup<Editor>({
    toolbar: 'grid-button',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addSplitButton('grid-button', {
        type: 'splitbutton',
        columns: 'auto',
        fetch: (callback) => {
          callback(
            Arr.map([ '1', '2', '3', '4', '5', '6', '7', '8' ], (num) => ({
              type: 'choiceitem',
              value: num,
              text: num,
              icon: 'fake-icon-name'
            } as Menu.ChoiceMenuItemSpec))
          );
        },
        onAction: store.adder('onAction'),
        onItemAction: store.adder('onItemAction')
      });
    }
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    ':focus { background-color: rgb(222, 224, 226); }'
  ]);

  it('Check structure of grid collection menu', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    Mouse.clickOn(SugarBody.body(), '.tox-split-button__chevron');
    const menu = await TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
    Assertions.assertStructure(
      'Checking structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--grid') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: Arr.map([ '1', '2', '3', '4', '5', '6', '7', '8' ], (num) => s.element('div', {
              classes: [ arr.has('tox-collection__item') ],
              attrs: {
                title: str.is(num)
              },
              children: [
                // NOTE: The oxide demo page has div, but I think that's just a mistake
                s.element('div', {
                  classes: [ arr.has('tox-collection__item-icon') ],
                  children: [
                    s.element('svg', {})
                  ]
                })
              ]
            }))
          })
        ]
      })),
      menu
    );

    await FocusTools.pTryOnSelector('Focus should be on 1', doc, '.tox-collection__item[title="1"]');
    TinyUiActions.keydown(editor, Keys.right());
    await FocusTools.pTryOnSelector('Focus should be on 2', doc, '.tox-collection__item[title="2"]');
    TinyUiActions.keydown(editor, Keys.right());
    await FocusTools.pTryOnSelector('Focus should be on 3', doc, '.tox-collection__item[title="3"]');
  });
});
