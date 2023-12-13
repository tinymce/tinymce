import { Mouse, UiFinder } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

interface Scenario {
  readonly options: RawEditorOptions;
  readonly initial: Array<{ clickOn: string; waitFor: string }>;
  readonly assertAbove: string;
  readonly assertBelow: string;
}

describe('browser.tinymce.themes.silver.editor.ToolbarBottomTest', () => {

  const getBounds = (selector: string) => {
    const elem = UiFinder.findIn<HTMLElement>(SugarBody.body(), selector).getOrDie();
    return Boxes.box(elem);
  };

  const pTest = async (scenario: Scenario) => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_location: 'bottom',
      ...scenario.options
    });

    await Arr.foldl(scenario.initial, (p, init) => p.then(async () => {
      Mouse.clickOn(SugarBody.body(), init.clickOn);
      await UiFinder.pWaitForVisible(`Wait for "${init.waitFor}" to be visible`, SugarBody.body(), init.waitFor);
    }), Promise.resolve());

    const upperBoxBounds = getBounds(scenario.assertAbove);
    const lowerBoxBounds = getBounds(scenario.assertBelow);
    assert.isBelow(upperBoxBounds.bottom - lowerBoxBounds.bottom, 5, `"${scenario.assertAbove}" should be placed above "${scenario.assertBelow}"`);
    McEditor.remove(editor);
  };

  context('Check the direction that menus open in when toolbar_location: "bottom"', () => {
    it('Bespoke select menu should open above button', () => pTest({
      options: {
        toolbar: 'styles'
      },
      initial: [{
        clickOn: 'button[title^="Format"]',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title^="Format"]'
    }));

    it('SplitButton menu should open above button', () => pTest({
      options: {
        toolbar: 'splitbutton',
        setup: (editor) => {
          editor.ui.registry.addSplitButton('splitbutton', {
            text: 'Test SplitButton',
            onItemAction: Fun.noop,
            fetch: (callback) => {
              callback([
                {
                  type: 'choiceitem',
                  text: 'text',
                  value: 'item'
                }
              ]);
            },
            onAction: Fun.noop
          });
        }
      },
      initial: [{
        clickOn: '.tox-split-button__chevron',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: '.tox-split-button__chevron'
    }));

    it('Floating overflow should open above overflow button', () => pTest({
      options: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('')
      },
      initial: [{
        clickOn: 'button[title="Reveal or hide additional toolbar items"]',
        waitFor: '.tox-toolbar__overflow'
      }],
      assertAbove: '.tox-toolbar__overflow',
      assertBelow: 'button[title="Reveal or hide additional toolbar items"]'
    }));

    it('Menu button in overflow toolbar should open up', () => pTest({
      options: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('') + 'align'
      },
      initial: [
        {
          clickOn: 'button[title="Reveal or hide additional toolbar items"]',
          waitFor: '.tox-toolbar__overflow'
        }, {
          clickOn: 'button[title^="Align"]',
          waitFor: 'div[role="menu"]'
        }
      ],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title^="Align"]'
    }));

    it('Menubar menu should open above button', () => pTest({
      options: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('') + 'align'
      },
      initial: [{
        clickOn: 'button:contains("File")',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button:contains("File")'
    }));

    it('Dropdown menu used in a dialog (i.e. not in the toolbar) should open downwards', () => pTest({
      options: {
        setup: (editor) => {
          editor.on('init', () => {
            editor.windowManager.open({
              title: 'Test Dialog',
              body: {
                type: 'panel',
                items: []
              },
              buttons: [
                {
                  type: 'menu',
                  items: [
                    {
                      type: 'togglemenuitem',
                      name: 'testitem',
                      text: 'Test item'
                    }
                  ]
                }
              ]
            });
          });
        }
      },
      initial: [{
        clickOn: 'div[role="dialog"] .tox-tbtn--select',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="dialog"] .tox-tbtn--select',
      assertBelow: 'div[role="menu"]'
    }));
  });
});
