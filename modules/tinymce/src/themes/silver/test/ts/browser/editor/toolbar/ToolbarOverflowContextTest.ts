import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { ToolbarMode } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarOverflowContextTest', () => {
  const makeButton = (ed: Editor, spec: { name: string; text: string; context: string; onSetup?: (api: any) => (api: any) => void; enabled?: boolean }) => {
    ed.ui.registry.addButton(spec.name, {
      icon: 'italic',
      text: spec.text,
      onAction: Fun.noop,
      onSetup: spec.onSetup,
      context: spec.context,
      enabled: spec.enabled
    });
  };

  const setupNodeChangeHandler = (ed: Editor, handler: () => void) => {
    ed.on('NodeChange', handler);
    handler();
    return () => ed.off('NodeChange', handler);
  };

  const assertButtonInToolbarDisabled = (selector: string) => {
    const overflow = UiFinder.findIn(SugarBody.body(), '.tox-toolbar__overflow').getOrDie();
    UiFinder.exists(overflow, `[data-mce-name="${selector}"][aria-disabled="true"]`);
  };

  const assertButtonInToolbarEnabled = (selector: string) => {
    const overflow = UiFinder.findIn(SugarBody.body(), '.tox-toolbar__overflow').getOrDie();
    UiFinder.exists(overflow, `[data-mce-name="${selector}"]:not([aria-disabled="true"])`);
  };

  const assertButtonNativelyEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);

  const pWaitForOverflowToolbar = async (editor: Editor, toolbarMode: ToolbarMode) => {
    const selector = `.tox-toolbar__overflow${toolbarMode === 'sliding' ? '--open' : ''}`;
    await TinyUiActions.pWaitForUi(editor, selector);
  };

  const pOpenOverflowToolbar = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="overflow-button"]');
    await pWaitForOverflowToolbar(editor, 'floating');
  };

  const closeOverflowToolbar = (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="overflow-button"]');
  };

  Arr.each([ 'floating', 'sliding' ], (toolbarMode) => {
    context(`${toolbarMode} overflow button`, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(50, Fun.constant('t1')).join(' | '),
        width: 1105,
        statusbar: false,
        toolbar_mode: toolbarMode,
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('t1', {
            icon: 'italic',
            text: 'Test Menu Item 4',
            onAction: Fun.noop
          });
        }
      }, [], true);

      it('TINY-11211: Overflow more toolbar button should always be enabled when in not in readonly mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        assertButtonNativelyEnabled('overflow-button');

        editor.mode.set('readonly');
        assertButtonNativelyEnabled('overflow-button');

        editor.mode.set('design');
        assertButtonNativelyEnabled('overflow-button');
      });
    });

    const toolbarButtons = {
      label: 'Normal toolbar button',
      buttonSetupAny: (ed: Editor) => makeButton(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeButton(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeButton(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeButton(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeButton(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeButton(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeButton(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeButton(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeButton(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't12', text: 't12', context: 'mode:design', enabled: false })
    };

    Arr.each([ toolbarButtons ], (scenario) => {
      context(`Toolbar buttons in ${toolbarMode} overflow toolbar`, () => {
        context('Toolbar button spec with context: any', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t1')).join(' | '),
            width: 1105,
            setup: (ed: Editor) => {
              scenario.buttonSetupAny(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be enabled in all modes when the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t1');

            editor.mode.set('readonly');
            assertButtonInToolbarEnabled('t1');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t1');
            closeOverflowToolbar(editor);
          });

          it(`TINY-11211: Should be enabled in all modes when the toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t1');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t1');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t1');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context mode:design', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t2')).join(' | '),
            width: 1105,
            setup: (ed: Editor) => {
              scenario.buttonSetupModeDesign(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be enabled in design mode when the toolbar is opened`, async () => {
            const editor = hook.editor();
            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t2');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t2');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t2');
            closeOverflowToolbar(editor);
          });

          it(`TINY-11211: Should be enabled in design mode when the toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t2');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t2');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t2');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: mode:readonly, switching modes in editor setup', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t3')).join(' | '),
            width: 1105,
            setup: (ed: Editor) => {
              scenario.buttonSetupModeReadonly(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be enabled in readonly mode when the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t3');

            editor.mode.set('readonly');
            assertButtonInToolbarEnabled('t3');

            editor.mode.set('design');
            assertButtonInToolbarDisabled('t3');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: editable', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t4')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupEditable(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be enabled in when selection is editable when the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t4');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t4');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t4');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: formatting:bold', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t5')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupFormattingBold(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be enabled when formatter can be applied when the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t5');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t5');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t5');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: mode:design and onSetup buttonApi setEnabled(false)', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t6')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupNodeChangeSetEnabledFalse(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be disabled when the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t6');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t6');

            editor.mode.set('design');
            // This differs from the test below because the handler in onSetup is not called
            assertButtonInToolbarEnabled('t6');
            editor.nodeChanged();
            assertButtonInToolbarDisabled('t6');
            closeOverflowToolbar(editor);
          });

          it(`TINY-11211: Should be disabled when the toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t6');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t6');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t6');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: mode:readonly and onSetup buttonApi setEnabled(true)', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t7')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupNodeChangeSetEnabledTrue(ed);
            }
          }, [], true);

          // The buttons are enabled because when switching mode and the state will be updated
          // but nodeChange is not fired.
          it(`TINY-11211: Should be enabled when nodeChange is fired and the toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t7');

            editor.mode.set('readonly');
            assertButtonInToolbarEnabled('t7');

            editor.mode.set('design');
            assertButtonInToolbarDisabled('t7');
            editor.nodeChanged();
            assertButtonInToolbarEnabled('t7');
            closeOverflowToolbar(editor);
          });

          // The button are enabled because when the toolbar is reopened, the setEnabled within the onSetup is called
          it(`TINY-11211: Should be enabled when the toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t7');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t7');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t7');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: mode:design and onSetup buttonApi setEnabled(false), without NodeChange', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t8')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupSetEnabledFalse(ed);
            }
          }, [], true);

          // When the toolbar is opened, switching modes check for the button context, and since the setEnabled(false) is not listening for anything, it gets re-enabled
          it(`TINY-11211: Should always be disabled when toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t8');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t8');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t8');
            editor.nodeChanged();
            assertButtonInToolbarEnabled('t8');
            closeOverflowToolbar(editor);
          });

          // This is because the toolbar buttons are attached again, so setEnabled(false) is called onLoad
          it(`TINY-11211: Should always be disabled when toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t8');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t8');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t8');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context: doesntmatch, should fallback to default mode:design', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t9')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupDoesntMatch(ed);
            }
          }, [], true);

          it(`TINY-11211: Should only be enabled in design mode when toolbar is opened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t9');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t9');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t9');
            editor.nodeChanged();
            assertButtonInToolbarEnabled('t9');
            closeOverflowToolbar(editor);
          });

          it(`TINY-11211: Should only be enabled in design mode when toolbar is reopened`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t9');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t9');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t9');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context mode:design, readonly: true editor option', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t10')).join(' | '),
            width: 1105,
            statusbar: false,
            readonly: true,
            setup: (ed: Editor) => {
              scenario.buttonSetupModeDesign2(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be disabled initially, when the mode is switched, button should behave like mode:design`, async () => {
            const editor = hook.editor();
            assertButtonNativelyEnabled('overflow-button');

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t10');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t10');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t10');
            editor.nodeChanged();
            assertButtonInToolbarEnabled('t10');
            closeOverflowToolbar(editor);
          });
        });

        context('Toolbar button spec with context insert:span', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t11')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupInsertSpan(ed);
            }
          }, [], true);

          it(`TINY-11211: Should be initially, when selection is changed, the state is reflected`, async () => {
            const editor = hook.editor();
            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarEnabled('t11');

            editor.setContent('<img src="https://picsum.photos/200/300"/>');
            editor.selection.select(editor.dom.select('img')[0]);
            await Waiter.pTryUntil('Wait until toolbar button is disabled', () => assertButtonInToolbarDisabled('t11'));
          });
        });

        context('Toolbar button spec enabled: false', () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            toolbar: Arr.range(50, Fun.constant('t12')).join(' | '),
            width: 1105,
            statusbar: false,
            setup: (ed: Editor) => {
              scenario.buttonSetupAnyEnabledFalse(ed);
            }
          }, [], true);

          // When the toolbar is opened, switching modes check for the button context, and since enabled is only checked onLoad, it gets re-enabled
          // Changing this will break integrations.
          it(`TINY-11211: Toolbar ${scenario.label} should be enabled in all modes`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t12');

            editor.mode.set('readonly');
            assertButtonInToolbarDisabled('t12');

            editor.mode.set('design');
            assertButtonInToolbarEnabled('t12');
            editor.nodeChanged();
            assertButtonInToolbarEnabled('t12');
            closeOverflowToolbar(editor);
          });

          // This is because the toolbar buttons are attached again, so DisablingConfigs onLoad follows the enabled spec
          it(`TINY-11211: Toolbar ${scenario.label} should be enabled in all modes`, async () => {
            const editor = hook.editor();
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t12');
            closeOverflowToolbar(editor);

            editor.mode.set('readonly');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t12');
            closeOverflowToolbar(editor);

            editor.mode.set('design');
            await pOpenOverflowToolbar(editor);
            assertButtonInToolbarDisabled('t12');
            closeOverflowToolbar(editor);
          });
        });
      });
    });
  });
});
