import { Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, TextContent } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as TooltipUtils from '../../../module/TooltipUtils';

interface TestScenario {
  readonly label: string;
  readonly pTriggerTooltip: (editor: Editor, selector: string) => Promise<void>;
}

describe('browser.tinymce.themes.silver.editor.TooltipTest', () => {

  Arr.each([
    { label: 'Mouse', pTriggerTooltip: TooltipUtils.pTriggerTooltipWithMouse },
    { label: 'Keyboard', pTriggerTooltip: TooltipUtils.pTriggerTooltipWithKeyboard },
  ], (test: TestScenario) => {
    context('Basic buttons', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'basic-button toggle-button menu-button split-button forecolor split-button-with-icon',
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('basic-button', {
            text: 'Button',
            tooltip: 'Button',
            onAction: Fun.noop
          });

          ed.ui.registry.addToggleButton('toggle-button', {
            text: 'Toggle Button',
            tooltip: 'Toggle Button',
            onAction: Fun.noop
          });

          ed.ui.registry.addMenuButton('menu-button', {
            text: 'Menu Button',
            tooltip: 'Menu Button',
            fetch: (success) => {
              success([
                {
                  type: 'togglemenuitem',
                  text: 'Toggle menu item',
                  onAction: Fun.noop,
                  active: true
                }
              ]);
            },
          });

          ed.ui.registry.addSplitButton('split-button', {
            text: 'Split Button',
            tooltip: 'Split Button',
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'choiceitem',
                }
              ]);
            },
            onAction: Fun.noop,
            onItemAction: Fun.noop
          });

          ed.ui.registry.addSplitButton('split-button-with-icon', {
            icon: 'bold',
            tooltip: 'Split Button with Icon',
            presets: 'listpreview',
            columns: 3,
            fetch: (success) => {
              success([
                {
                  type: 'choiceitem',
                  value: 'lower-alpha-1',
                  icon: 'list-num-lower-alpha',
                  text: 'Lower Alpha 1'
                },
                {
                  type: 'choiceitem',
                  value: 'lower-alpha-2',
                  icon: 'list-num-lower-alpha',
                  text: 'Lower Alpha 2'
                },
                {
                  type: 'choiceitem',
                  value: 'lower-alpha-3',
                  icon: 'list-num-lower-alpha',
                  text: 'Lower Alpha 3'
                }
              ]);
            },
            onAction: Fun.noop,
            onItemAction: Fun.noop,
            select: Fun.always,
            onSetup: () => Fun.noop
          });
        }
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="basic-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addToggleButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="toggle-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Toggle Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addMenuButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="menu-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Menu Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addSplitButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'div[data-mce-label="split-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Split Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar Split Button Menu - forecolor`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'div[data-mce-label="forecolor"] > .tox-tbtn + .tox-split-button__chevron';
        await TooltipUtils.pOpenMenu(editor, buttonSelector);
        await Waiter.pWait(300);
        const menuSelector = 'div[data-mce-name="Red"]';
        await test.pTriggerTooltip(editor, menuSelector);
        const tooltip = await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("Red")') as SugarElement<HTMLElement>;
        assert.equal(TextContent.get(tooltip), 'Red');
        await TooltipUtils.pCloseTooltip(editor, menuSelector);
        await TooltipUtils.pCloseMenu(menuSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar Split Button Menu - listpreview`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'div[data-mce-label="split-button-with-icon"]  > .tox-tbtn + .tox-split-button__chevron';
        await TooltipUtils.pOpenMenu(editor, buttonSelector);
        const menuSelector = 'div[aria-label="Lower Alpha 1"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, menuSelector), 'Lower Alpha 1');
        await TooltipUtils.pCloseTooltip(editor, menuSelector);
        await TooltipUtils.pCloseMenu(menuSelector);
      });
    });

    context('Dialog related buttons', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'dialog-button dialog-footer-button size-input-dialog-button',
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('dialog-button', {
            text: 'Dialog Button',
            onAction: () => {
              ed.windowManager.open({
                title: 'Test Dialog',
                size: 'normal',
                body: {
                  type: 'panel',
                  items: [{
                    type: 'button',
                    name: 'prev',
                    text: 'Test-Button',
                    icon: 'action-prev',
                  }]
                }
              });
            }
          });

          ed.ui.registry.addButton('dialog-footer-button', {
            text: 'Dialog Footer Button',
            onAction: () => {
              ed.windowManager.open({
                title: 'Test Dialog',
                size: 'normal',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'input',
                      name: 'width',
                      label: 'Width'
                    },
                  ]
                },
                buttons: [{
                  type: 'menu',
                  name: 'options',
                  icon: 'Preferences',
                  tooltip: 'Preferences',
                  align: 'start',
                  items: [{
                    type: 'togglemenuitem',
                    name: 'menuitem1',
                    text: 'Menu item 1',
                  }]
                }]
              });
            }
          });

          ed.ui.registry.addButton('size-input-dialog-button', {
            text: 'Dialog Button',
            onAction: () => {
              ed.windowManager.open({
                title: 'Test Dialog',
                size: 'normal',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'sizeinput',
                      name: 'dimensions',
                      label: 'Constrain proportions',
                      constrain: true
                    }
                  ]
                }
              });
            }
          });
        }
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - button without label in Dialog`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-label="Test-Button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Test-Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - sizeinput - 'Constrain Proportions' in Dialog`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="size-input-dialog-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-label="Constrain proportions"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Constrain proportions');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - dialog footer button`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-footer-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-label="Preferences"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Preferences');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - dialog close button`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-footer-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-label="close"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Close');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });
    });

    context('Bespoke buttons', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'fontsizeinput fontsize fontfamily align styles blocks',
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontsizeinput - Decrease font size`, async () => {
        const editor = hook.editor();
        const buttonSelector = '[data-mce-label="fontsizeinput"] > [data-mce-label="minus"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Decrease font size');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontsizeinput - Increase font size`, async () => {
        const editor = hook.editor();
        const buttonSelector = '[data-mce-label="fontsizeinput"] > [data-mce-label="plus"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Increase font size');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontsize`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="fontsize"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Font size 12pt');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontfamily`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="fontfamily"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Font System Font');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - align`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="align"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Alignment left');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - blocks`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="blocks"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Block Paragraph');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - styles`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="styles"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Format Paragraph');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });
    });

    context('Resize handle', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        resize: 'both'
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - resize handle`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'div[data-mce-label="resize-handle"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Resize');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });
    });

    context('overflow-button', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        toolbar: Arr.range(25, Fun.constant('bold | italic | test-button')).join(' '),
        toolbar_mode: 'floating',
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('test-button', {
            text: 'Test Button for Overflow Button',
            onAction: Fun.noop
          });
        },
        base_url: '/project/tinymce/js/tinymce'
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - overflow more button`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-label="overflow-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Reveal or hide additional toolbar items');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });
    });

    context('No tooltip', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        toolbar: 'split-button',
        toolbar_mode: 'floating',
        setup: (ed: Editor) => {
          ed.ui.registry.addSplitButton('split-button', {
            text: 'Split Button',
            tooltip: 'Split Button',
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'choiceitem',
                }
              ]);
            },
            onAction: Fun.noop,
            onItemAction: Fun.noop
          });
        },
        base_url: '/project/tinymce/js/tinymce'
      });

      it(`TINY-10453: Should not show tooltip with ${test.label} - Contains text and no icon`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'div[data-mce-label="split-button"] > .tox-tbtn + .tox-split-button__chevron';
        await TooltipUtils.pOpenMenu(editor, buttonSelector);
        const menuSelector = '[aria-label="Choice item 1"]';
        await TooltipUtils.pAssertNoTooltip(editor, () => test.pTriggerTooltip(editor, menuSelector), '');
        await TooltipUtils.pCloseMenu(menuSelector);
      });
    });
  });
});
