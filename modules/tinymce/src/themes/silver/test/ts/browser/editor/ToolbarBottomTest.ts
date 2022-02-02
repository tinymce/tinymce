import { Mouse, UiFinder } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Theme from 'tinymce/themes/silver/Theme';

interface Scenario {
  readonly settings: RawEditorSettings;
  readonly initial: Array<{ clickOn: string; waitFor: string }>;
  readonly assertAbove: string;
  readonly assertBelow: string;
}

describe('browser.tinymce.themes.silver.editor.ToolbarBottomTest', () => {
  before(() => {
    Theme();
  });

  const getBounds = (selector: string) => {
    const elem = UiFinder.findIn(SugarBody.body(), selector).getOrDie();
    return Boxes.box(elem);
  };

  const pTest = async (scenario: Scenario) => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_location: 'bottom',
      ...scenario.settings
    });

    await Arr.foldl(scenario.initial, (p, init) => p.then(async () => {
      Mouse.clickOn(SugarBody.body(), init.clickOn);
      await UiFinder.pWaitForVisible(`Wait for "${init.waitFor}" to be visible`, SugarBody.body(), init.waitFor);
    }), PromisePolyfill.resolve());

    const upperBoxBounds = getBounds(scenario.assertAbove);
    const lowerBoxBounds = getBounds(scenario.assertBelow);
    assert.isBelow(upperBoxBounds.bottom - lowerBoxBounds.bottom, 5, `"${scenario.assertAbove}" should be placed above "${scenario.assertBelow}"`);
    McEditor.remove(editor);
  };

  context('Check the direction that menus open in when toolbar_location: "bottom"', () => {
    it('Bespoke select menu should open above button', () => pTest({
      settings: {
        toolbar: 'styleselect'
      },
      initial: [{
        clickOn: 'button[title="Formats"]',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title="Formats"]'
    }));

    it('SplitButton menu should open above button', () => pTest({
      settings: {
        toolbar: 'splitbutton',
        setup: (editor) => {
          editor.ui.registry.addSplitButton('splitbutton', {
            text: 'Test SplitButton',
            onItemAction: Fun.noop,
            fetch: (callback) => {
              callback([
                {
                  type: 'choiceitem',
                  text: 'text'
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
      settings: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('')
      },
      initial: [{
        clickOn: 'button[title="More..."]',
        waitFor: '.tox-toolbar__overflow'
      }],
      assertAbove: '.tox-toolbar__overflow',
      assertBelow: 'button[title="More..."]'
    }));

    it('Menu button in overflow toolbar should open up', () => pTest({
      settings: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('') + 'align'
      },
      initial: [
        {
          clickOn: 'button[title="More..."]',
          waitFor: '.tox-toolbar__overflow'
        }, {
          clickOn: 'button[title="Align"]',
          waitFor: 'div[role="menu"]'
        }
      ],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title="Align"]'
    }));

    it('Menubar menu should open above button', () => pTest({
      settings: {
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
      settings: {
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
