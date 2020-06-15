import { Assertions, Chain, Log, Mouse, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('ToolbarBottomTest - assert direction that menus open in when toolbar_location: "bottom"', (success, failure) => {
  Theme();

  interface Scenario {
    message: string;
    settings: RawEditorSettings;
    initial: Array<{ clickOn: string; waitFor: string }>;
    assertAbove: string;
    assertBelow: string;
  }

  const sScenarioAsStep = (scenario: Scenario) => {
    const nuSettings = {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      toolbar_location: 'bottom',
      ...scenario.settings
    };

    return Log.chainsAsStep('', scenario.message, [
      NamedChain.asChain([
        NamedChain.write('editor', McEditor.cFromSettings(nuSettings)),
        NamedChain.writeValue('body', Body.body()),
        ...Arr.flatten(Arr.map(scenario.initial, (p) => [
          NamedChain.read('body', Mouse.cClickOn(p.clickOn)),
          NamedChain.read('body', UiFinder.cWaitForVisible(`Wait for "${p.waitFor}" to be visible`, p.waitFor))
        ])),
        NamedChain.direct('body', Chain.fromChains([ UiFinder.cFindIn(scenario.assertAbove), Chain.mapper(Boxes.box) ]), 'upperBoxBounds'),
        NamedChain.direct('body', Chain.fromChains([ UiFinder.cFindIn(scenario.assertBelow), Chain.mapper(Boxes.box) ]), 'lowerBoxBounds'),
        Chain.op((input) => {
          Assertions.assertEq(
            `"${scenario.assertAbove}" should be placed above "${scenario.assertBelow}"`,
            true,
            input.upperBoxBounds.bottom - input.lowerBoxBounds.y < 5
          );
        }),
        NamedChain.read('editor', McEditor.cRemove)
      ])
    ]);
  };

  Pipeline.async({ }, [
    sScenarioAsStep({
      message: 'Bespoke select menu should open above button',
      settings: {
        toolbar: 'styleselect'
      },
      initial: [{
        clickOn: 'button[title="Formats"]',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title="Formats"]'
    }),

    sScenarioAsStep({
      message: 'SplitButton menu should open above button',
      settings: {
        toolbar: 'splitbutton',
        setup: (editor) => {
          editor.ui.registry.addSplitButton('splitbutton', {
            text: 'Test SplitButton',
            onItemAction: () => { },
            fetch: (callback) => {
              callback([
                {
                  type: 'choiceitem',
                  text: 'text'
                }
              ]);
            },
            onAction: () => {}
          });
        }
      },
      initial: [{
        clickOn: '.tox-split-button__chevron',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: '.tox-split-button__chevron'
    }),

    sScenarioAsStep({
      message: 'Floating overflow should open above overflow button',
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
    }),

    sScenarioAsStep({
      message: 'Menu button in overflow toolbar should open up',
      settings: {
        width: 500,
        toolbar_mode: 'floating',
        toolbar: Arr.range(10, Fun.constant('bold | italic ')).join('') + 'align'
      },
      initial: [{
        clickOn: 'button[title="More..."]',
        waitFor: '.tox-toolbar__overflow'
      }, {
        clickOn: 'button[title="Align"]',
        waitFor: 'div[role="menu"]'
      }],
      assertAbove: 'div[role="menu"]',
      assertBelow: 'button[title="Align"]'
    }),

    sScenarioAsStep({
      message: 'Menubar menu should open above button',
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
    }),

    sScenarioAsStep({
      message: 'Dropdown menu used in a dialog (i.e. not in the toolbar) should open downwards',
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
    })
  ], success, failure);
});
