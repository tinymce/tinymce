import { Keys, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement, TextContent } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface EditorWithTestApis extends Editor {
  testSplitButtonApi?: () => Optional<any>;
  testSplitButtonNoChevronApi?: () => Optional<any>;
}

import * as TooltipUtils from '../../../module/TooltipUtils';

const getSplitButtonApi = (editor: EditorWithTestApis) => {
  const apiFunction = editor.testSplitButtonApi;
  if (!apiFunction) {
    throw new Error('Split button test API function not registered');
  }
  return apiFunction().getOrDie('Split button API not available');
};

const getSplitButtonNoChevronApi = (editor: EditorWithTestApis) => {
  const apiFunction = editor.testSplitButtonNoChevronApi;
  if (!apiFunction) {
    throw new Error('Split button no-chevron test API function not registered');
  }
  return apiFunction().getOrDie('Split button no-chevron API not available');
};

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
            chevronTooltip: 'Split Button menu',
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
            chevronTooltip: 'Split Button with Icon menu',
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
        const buttonSelector = 'button[data-mce-name="basic-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-12053: Should trigger tooltip with ${test.label} - Toolbar addButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="basic-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Button');
        await TooltipUtils.pHoverOverTooltipBeforeClosing(editor, buttonSelector, 500);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addToggleButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="toggle-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Toggle Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addMenuButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="menu-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Menu Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar addSplitButton`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="split-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Split Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-8665: Should trigger chevron tooltip with ${test.label} - Toolbar addSplitButton chevron`, async () => {
        const editor = hook.editor();
        const chevronSelector = 'button[data-mce-name="split-button-chevron"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, chevronSelector), 'Split Button menu');
        await TooltipUtils.pCloseTooltip(editor, chevronSelector);
      });

      it(`TINY-8665: Should trigger chevron tooltip with ${test.label} - Toolbar addSplitButton with icon chevron`, async () => {
        const editor = hook.editor();
        const chevronSelector = 'button[data-mce-name="split-button-with-icon-chevron"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, chevronSelector), 'Split Button with Icon menu');
        await TooltipUtils.pCloseTooltip(editor, chevronSelector);
      });

      it(`TINY-12054: Should trigger tooltip with ${test.label} - And escape closes it.`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="split-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Split Button');
        TinyContentActions.keyup(editor, Keys.escape());
        await TooltipUtils.pAssertNoTooltipShown();
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - Toolbar Split Button Menu - forecolor`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="forecolor-chevron"]';
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
        const buttonSelector = 'button[data-mce-name="split-button-with-icon-chevron"]';
        await TooltipUtils.pOpenMenu(editor, buttonSelector);
        const menuSelector = 'div[aria-label="Lower Alpha 1"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, menuSelector), 'Lower Alpha 1');
        await TooltipUtils.pCloseTooltip(editor, menuSelector);
        await TooltipUtils.pCloseMenu(menuSelector);
      });
    });

    context('SetTooltip API for split buttons', () => {
      const hook = TinyHooks.bddSetup<EditorWithTestApis>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'test-split-button test-split-button-no-chevron',
        setup: (ed: EditorWithTestApis) => {
          let splitButtonApi: any = null;
          let splitButtonNoChevronApi: any = null;

          ed.ui.registry.addSplitButton('test-split-button', {
            text: 'Initial Tooltip',
            tooltip: 'Initial Tooltip',
            chevronTooltip: 'Initial Chevron Tooltip',
            fetch: (success) => {
              success([{ type: 'choiceitem', text: 'Item 1' }]);
            },
            onAction: Fun.noop,
            onItemAction: Fun.noop,
            onSetup: (api) => {
              splitButtonApi = api;
              return Fun.noop;
            }
          });

          ed.ui.registry.addSplitButton('test-split-button-no-chevron', {
            text: 'No Chevron',
            tooltip: 'No Chevron Tooltip',
            // No chevronTooltip - should auto-generate
            fetch: (success) => {
              success([{ type: 'choiceitem', text: 'Item 1' }]);
            },
            onAction: Fun.noop,
            onItemAction: Fun.noop,
            onSetup: (api) => {
              splitButtonNoChevronApi = api;
              return Fun.noop;
            }
          });

          // Expose APIs for testing
          ed.testSplitButtonApi = () => Optional.from(splitButtonApi);
          ed.testSplitButtonNoChevronApi = () => Optional.from(splitButtonNoChevronApi);
        }
      });

      it(`TINY-8665: setTooltip should update both main and chevron tooltips with ${test.label}`, async () => {
        const editor = hook.editor();
        const api = getSplitButtonApi(editor);

        // Update tooltip
        api.setTooltip('Updated Tooltip');

        // Test main button tooltip
        const mainSelector = 'button[data-mce-name="test-split-button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, mainSelector), 'Updated Tooltip');
        await TooltipUtils.pCloseTooltip(editor, mainSelector);

        // Test chevron button tooltip (should use explicit chevronTooltip)
        const chevronSelector = 'button[data-mce-name="test-split-button-chevron"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, chevronSelector), 'Initial Chevron Tooltip');
        await TooltipUtils.pCloseTooltip(editor, chevronSelector);
      });

      it(`TINY-8665: setTooltip should auto-generate chevron tooltip when not explicitly set with ${test.label}`, async () => {
        const editor = hook.editor();
        const api = getSplitButtonNoChevronApi(editor);

        // Update tooltip
        api.setTooltip('New Tooltip');

        // Test main button tooltip
        const mainSelector = 'button[data-mce-name="test-split-button-no-chevron"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, mainSelector), 'New Tooltip');
        await TooltipUtils.pCloseTooltip(editor, mainSelector);

        // Test chevron button tooltip (should auto-generate from main tooltip)
        const chevronSelector = 'button[data-mce-name="test-split-button-no-chevron-chevron"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, chevronSelector), 'New Tooltip menu');
        await TooltipUtils.pCloseTooltip(editor, chevronSelector);
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
                buttons: [
                  {
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
                  },
                  {
                    type: 'togglebutton',
                    text: 'notooltip',
                    align: 'start',
                  },
                ]
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
        const buttonSelector = '[data-mce-name="Test-Button"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Test-Button');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - sizeinput - 'Constrain Proportions' in Dialog`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="size-input-dialog-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-name="Constrain proportions"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Constrain proportions');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - dialog footer button`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-footer-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-name="Preferences"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Preferences');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - dialog close button`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-footer-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-name="close"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Close');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        TinyUiActions.closeDialog(editor);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - dialog footer button - togglebutton`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="dialog-footer-button"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForDialog(editor);
        const buttonSelector = '[data-mce-name="notooltip"]';
        await TooltipUtils.pAssertNoTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), '');
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
        const buttonSelector = '[data-mce-name="fontsizeinput"] > [data-mce-name="minus"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Decrease font size');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontsizeinput - Increase font size`, async () => {
        const editor = hook.editor();
        const buttonSelector = '[data-mce-name="fontsizeinput"] > [data-mce-name="plus"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Increase font size');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontsize`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="fontsize"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Font size 12pt');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - fontfamily`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="fontfamily"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Font System Font');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - align`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="align"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Alignment left');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - blocks`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="blocks"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Block Paragraph');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it(`TINY-10453: Should trigger tooltip with ${test.label} - styles`, async () => {
        const editor = hook.editor();
        const buttonSelector = 'button[data-mce-name="styles"]';
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
        const buttonSelector = 'div[data-mce-name="resize-handle"]';
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
        const buttonSelector = 'button[data-mce-name="overflow-button"]';
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
            chevronTooltip: 'Split Button menu',
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
        const buttonSelector = 'button[data-mce-name="split-button-chevron"]';
        await TooltipUtils.pOpenMenu(editor, buttonSelector);
        const menuSelector = '[aria-label="Choice item 1"]';
        await TooltipUtils.pAssertNoTooltip(editor, () => test.pTriggerTooltip(editor, menuSelector), '');
        await TooltipUtils.pCloseMenu(menuSelector);
      });
    });

    context('View', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'test-view',
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('test-view', {
            text: 'Test View',
            onAction: () => {
              ed.execCommand('ToggleView', false, 'view');
            }
          });
          ed.ui.registry.addView('view', {
            buttons: [
              {
                type: 'group',
                buttons: [
                  {
                    type: 'togglebutton' as const,
                    icon: 'fullscreen',
                    tooltip: 'Fullscreen',
                    onAction: Fun.noop
                  },
                  {
                    type: 'togglebutton',
                    icon: 'copy',
                    text: 'Copy code',
                    onAction: Fun.noop
                  },
                  {
                    type: 'togglebutton',
                    text: 'Copy code 2',
                    onAction: Fun.noop
                  },
                  {
                    type: 'togglebutton',
                    icon: 'Bold',
                    tooltip: 'Bold',
                    onAction: Fun.noop
                  },
                ]
              }
            ],
            onShow: Fun.noop,
            onHide: Fun.noop
          });
        }
      });

      it(`TINY-10672: Should trigger tooltip with ${test.label} - View togglebutton - with tooltip and icon, no text`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="test-view"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForUi(editor, '.tox-view-wrap');
        const buttonSelector = 'button[aria-label="Fullscreen"]';
        await TooltipUtils.pAssertTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), 'Fullscreen');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        editor.execCommand('ToggleView', false, 'view');
      });

      it(`TINY-10672: Should not trigger tooltip with ${test.label} - View togglebutton - with text and icon, no tooltip`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="test-view"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForUi(editor, '.tox-view-wrap');
        const buttonSelector = 'button[aria-label="Copy code"]';
        await TooltipUtils.pAssertNoTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), '');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        editor.execCommand('ToggleView', false, 'view');
      });

      it(`TINY-10672: Should not trigger tooltip with ${test.label} - View togglebutton - with text, no icon and tooltip`, async () => {
        const editor = hook.editor();
        const toolbarButtonSelector = '[data-mce-name="test-view"]';
        TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
        await TinyUiActions.pWaitForUi(editor, '.tox-view-wrap');
        const buttonSelector = 'button[aria-label="Copy code 2"]';
        await TooltipUtils.pAssertNoTooltip(editor, () => test.pTriggerTooltip(editor, buttonSelector), '');
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        editor.execCommand('ToggleView', false, 'view');
      });
    });
  });
});
