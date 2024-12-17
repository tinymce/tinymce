import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Type } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarButtonContextTest', () => {
  const assertButtonEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertButtonNativelyDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][disabled="disabled"]`);

  const assertButtonNativelyEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);

  const setupNodeChangeHandler = (ed: Editor, handler: () => void) => {
    ed.on('NodeChange', handler);
    handler();
    return () => ed.off('NodeChange', handler);
  };

  // Menu/Button part of split button
  const assertMenuPartEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"] > span.tox-tbtn.tox-tbtn--select[aria-disabled="true"]`);

  const makeSplitButton = (
    ed: Editor,
    spec: {
      name: string;
      text: string;
      context: string;
      onSetup?: (api: any) => (api: any) => void;
      fetch?: (success: any) => void;
    }
  ) => {
    ed.ui.registry.addSplitButton(spec.name, {
      icon: 'italic',
      text: spec.text,
      onSetup: spec.onSetup,
      context: spec.context,
      onAction: Fun.noop,
      onItemAction: Fun.noop,
      fetch: (success) => {
        Type.isNonNullable(spec.fetch) ? spec.fetch(success) : success([{
          type: 'choiceitem',
          text: 'test'
        }]);
      }
    });
  };

  const makeMenuButton = (
    ed: Editor,
    spec: {
      name: string;
      text: string;
      context: string;
      onSetup?: (api: any) => (api: any) => void;
      fetch?: (success: any, fetchContext: any, api: any) => void;
    }
  ) => {
    ed.ui.registry.addMenuButton(spec.name, {
      icon: 'italic',
      text: spec.text,
      onSetup: spec.onSetup,
      context: spec.context,
      fetch: (success, fetchContext, api) => {
        Type.isNonNullable(spec.fetch) ? spec.fetch(success, fetchContext, api) : success([{
          type: 'menuitem',
          text: 'test'
        }]);
      }
    });
  };

  const makeToggleButton = (ed: Editor, spec: { name: string; text: string; context: string; onSetup?: (api: any) => (api: any) => void; enabled?: boolean }) => {
    ed.ui.registry.addToggleButton(spec.name, {
      icon: 'italic',
      text: spec.text,
      onAction: Fun.noop,
      onSetup: spec.onSetup,
      context: spec.context,
      enabled: spec.enabled
    });
  };

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

  const setupButtonsScenario = [
    {
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
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't12', text: 't12', context: 'mode:design', enabled: false }),
      assertButtonEnabled,
      assertButtonDisabled
    },
    {
      label: 'Toggle toolbar button',
      buttonSetupAny: (ed: Editor) => makeToggleButton(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeToggleButton(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeToggleButton(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeToggleButton(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeToggleButton(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeToggleButton(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeToggleButton(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeToggleButton(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeToggleButton(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeToggleButton(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeToggleButton(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeToggleButton(ed, { name: 't12', text: 't12', context: 'mode:design', enabled: false }),
      assertButtonEnabled,
      assertButtonDisabled
    },
    {
      label: 'Menu toolbar button',
      buttonSetupAny: (ed: Editor) => makeMenuButton(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeMenuButton(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeMenuButton(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeMenuButton(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeMenuButton(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeMenuButton(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeMenuButton(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeMenuButton(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeMenuButton(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeMenuButton(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeMenuButton(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeMenuButton(ed, { name: 't12', text: 't12', context: 'any' }),
      assertButtonEnabled: assertButtonNativelyEnabled,
      assertButtonDisabled: assertButtonNativelyDisabled
    },
    {
      label: 'Split toolbar button',
      buttonSetupAny: (ed: Editor) => makeSplitButton(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeSplitButton(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeSplitButton(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeSplitButton(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeSplitButton(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeSplitButton(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeSplitButton(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeSplitButton(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeSplitButton(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeSplitButton(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeSplitButton(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeSplitButton(ed, { name: 't12', text: 't12', context: 'any' }),
      assertButtonEnabled: (selector: string) => {
        assertMenuPartEnabled(selector);
        assertButtonEnabled(selector);
      },
      assertButtonDisabled
    },
  ];

  Arr.each(setupButtonsScenario, (scenario) => {
    context(scenario.label, () => {
      context('Toolbar button spec with context: any', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't1',
          setup: (ed: Editor) => {
            scenario.buttonSetupAny(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in all modes`, async () => {
          const editor = hook.editor();
          scenario.assertButtonEnabled('t1');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t1');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t1');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          scenario.assertButtonEnabled('t1');

          editor.setEditableRoot(false);
          scenario.assertButtonEnabled('t1');

          editor.setEditableRoot(true);
          scenario.assertButtonEnabled('t1');
        });
      });

      context('Toolbar button spec with context: any, switching modes in editor setup', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't1',
          setup: (ed: Editor) => {

            scenario.buttonSetupAny(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in all modes`, async () => {
          const editor = hook.editor();
          scenario.assertButtonEnabled('t1');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t1');
        });
      });

      context('Toolbar button spec with context mode:design', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't2',
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should only be enabled in design mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t2');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t2');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t2');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          scenario.assertButtonEnabled('t2');

          editor.setEditableRoot(false);
          scenario.assertButtonEnabled('t2');
        });
      });

      context('Toolbar button spec with context: mode:design, switching modes in editor setup ', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't2',
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in design mode only`, async () => {
          const editor = hook.editor();
          scenario.assertButtonDisabled('t2');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t2');
        });
      });

      context('Toolbar button spec with context: mode:readonly', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't3',
          setup: (ed: Editor) => {

            scenario.buttonSetupModeReadonly(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in readonly mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t3');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t3');

          editor.mode.set('design');
          scenario.assertButtonDisabled('t3');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          scenario.assertButtonDisabled('t3');

          editor.setEditableRoot(false);
          scenario.assertButtonDisabled('t3');
        });
      });

      context('Toolbar button spec with context: mode:readonly, switching modes in editor setup', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't3',
          setup: (ed: Editor) => {
            scenario.buttonSetupModeReadonly(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should only be enabled in readonly mode`, async () => {
          const editor = hook.editor();
          scenario.assertButtonEnabled('t3');

          editor.mode.set('design');
          scenario.assertButtonDisabled('t3');
        });
      });

      context('Toolbar button spec with context: editable', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't4',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupEditable(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled when selection is editable`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t4');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t4');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should be disabled in non-editable root`, async () => {
          const editor = hook.editor();
          editor.setEditableRoot(false);
          editor.mode.set('design');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t4');

          editor.setEditableRoot(true);
          editor.mode.set('design');
          scenario.assertButtonEnabled('t4');
        });
      });

      context('Toolbar button spec with context: formatting:bold', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't5',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupFormattingBold(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled when formatter can be applied`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t5');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t5');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t5');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should not be enabled when formatter cannot be applied`, () => {
          const editor = hook.editor();
          editor.setContent('<p>test</p>');
          scenario.assertButtonEnabled('t5');
          editor.setEditableRoot(false);
          scenario.assertButtonDisabled('t5');
          editor.setEditableRoot(true);
          scenario.assertButtonEnabled('t5');
        });
      });

      context('Toolbar button spec with context: mode:design and onSetup buttonApi setEnabled(false)', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't6',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupNodeChangeSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t6');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t6');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t6');
          // Since the onSetup for this button is listening for the NodeChange event, manually dispatching a nodeChanged to trigger a state change
          editor.nodeChanged();
          scenario.assertButtonDisabled('t6');
        });
      });

      context('Toolbar button spec with context: mode:readonly and onSetup buttonApi setEnabled(true)', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't7',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupNodeChangeSetEnabledTrue(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t7');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t7');

          editor.mode.set('design');
          scenario.assertButtonDisabled('t7');
          editor.nodeChanged();
          scenario.assertButtonEnabled('t7');
        });
      });

      context('Toolbar button spec with context: mode:design and onSetup buttonApi setEnabled(false), without NodeChange', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't8',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should always be disabled`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t8');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t8');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t8');
        });
      });

      context('Toolbar button spec with context: doesntmatch, should fallback to default mode:design', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't9',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupDoesntMatch(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should fall back to mode:design`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t9');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t9');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t9');
        });
      });

      context('Toolbar button spec with context mode:design, readonly: true editor option', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't10',
          statusbar: false,
          readonly: true,
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign2(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be disabled initially`, async () => {
          const editor = hook.editor();
          scenario.assertButtonDisabled('t10');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t10');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t10');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t10');
        });
      });

      context('Toolbar button spec with context insert:span', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't11',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupInsertSpan(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be disabled initially`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t11');

          editor.setContent('<img src="https://picsum.photos/200/300"/>');
          editor.selection.select(editor.dom.select('img')[0]);
          await Waiter.pTryUntil('Wait until toolbar button is disabled', () => scenario.assertButtonDisabled('t11'));
        });
      });

      // Missing enabled property in menu/split toolbar button spec
      (scenario.label === 'Menu toolbar button' || scenario.label === 'Split toolbar button' ? context.skip : context)('Toolbar button spec enabled: false', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't12',
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupAnyEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be stay disabled when enabled: false`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t12');
          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t12');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t12');
        });
      });
    });
  });

  const makeMenuButtonWithItem = (ed: Editor, label: string, context: string, onSetup?: (api: any) => (api: any) => void, enabled: boolean = true ) => {
    makeMenuButton(ed, { name: label, text: label, context: 'any', fetch: (success) => {
      success([{ type: 'menuitem', text: 'test', context, onSetup, enabled }]);
    } });
  };

  const menuButtonSetup = {
    buttonSetupAny: (ed: Editor) => makeMenuButtonWithItem(ed, 't1', 'any'),
    buttonSetupModeDesign: (ed: Editor) => makeMenuButtonWithItem(ed, 't2', 'mode:design'),
    buttonSetupModeReadonly: (ed: Editor) => makeMenuButtonWithItem(ed, 't3', 'mode:readonly'),
    buttonSetupEditable: (ed: Editor) => makeMenuButtonWithItem(ed, 't4', 'editable'),
    buttonSetupFormattingBold: (ed: Editor) => makeMenuButtonWithItem(ed, 't5', 'formatting:bold'),
    buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeMenuButtonWithItem(ed, 't6', 'mode:design', (buttonApi) => setupNodeChangeHandler(ed, () => buttonApi.setEnabled(false))),
    buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeMenuButtonWithItem(ed, 't7', 'mode:readonly', (buttonApi) => setupNodeChangeHandler(ed, () => buttonApi.setEnabled(true))),
    buttonSetupSetEnabledFalse: (ed: Editor) => makeMenuButtonWithItem(ed, 't8', 'mode:readonly', (buttonApi) => {
      buttonApi.setEnabled(false);
      return Fun.noop;
    }),
    buttonSetupDoesntMatch: (ed: Editor) => makeMenuButtonWithItem(ed, 't9', 'doesntmatch'),
    buttonSetupInsertSpan: (ed: Editor) => makeMenuButtonWithItem(ed, 't10', 'insert:span'),
    buttonSetupAnyEnabledFalse: (ed: Editor) => makeMenuButtonWithItem(ed, 't11', 'any', () => Fun.noop, false)
  };

  context('Menu item under Menu toolbar button', () => {
    const assertButtonEnabled = (label: string) => UiFinder.exists(SugarBody.body(), `[aria-label="${label}"]:not([aria-disabled="true"])`);

    const assertButtonDisabled = (label: string) => UiFinder.exists(SugarBody.body(), `[aria-label="${label}"][aria-disabled="true"]`);

    const pCloseMenu = async (editor: Editor): Promise<void> => {
      const uiRoot = TinyUiActions.getUiRoot(editor);
      TinyUiActions.keyup(editor, Keys.escape());
      TinyUiActions.keyup(editor, Keys.escape());
      await Waiter.pTryUntil('Waiting for menu to be closed', () => UiFinder.notExists(uiRoot, '.tox-menu.tox-selected-menu'));
    };

    const pWaitForMenu = async (editor: Editor) => TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-selected-menu');

    const pClickToolbarAndWait = (editor: Editor, selector: string) => {
      TinyUiActions.clickOnToolbar(editor, `[data-mce-name="${selector}"]`);
      return pWaitForMenu(editor);
    };

    context('Menu item with context: any', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));

      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't1',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupAny(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled in all modes', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't1');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't1');
        assertButtonEnabled('test');
      });

      it('TINY-11211: Menu item should be enabled in noneditable selection', async () => {
        const editor = hook.editor();
        editor.setContent('<p>a</p>');
        await pClickToolbarAndWait(editor, 't1');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.setEditableRoot(false);
        await pClickToolbarAndWait(editor, 't1');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.setEditableRoot(true);
        await pClickToolbarAndWait(editor, 't1');
        assertButtonEnabled('test');
      });
    });

    context('Menu item with context: mode:design', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't2',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupModeDesign(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled in design mode only', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't2');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't2');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't2');
        assertButtonEnabled('test');
      });
    });

    context('Menu item under Menu toolbar button with context: mode:readonly', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't3',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupModeReadonly(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled in readonly mode only', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't3');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't3');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't3');
        assertButtonDisabled('test');
      });
    });

    context('Menu item with context: editable', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't4',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupEditable(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled when selection is editable', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't4');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't4');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
      });

      it('TINY-11211: Menu item should be disabled in non-editable root', async () => {
        const editor = hook.editor();
        editor.setEditableRoot(false);
        await pClickToolbarAndWait(editor, 't4');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't4');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        editor.setEditableRoot(true);
        await pClickToolbarAndWait(editor, 't4');
        assertButtonEnabled('test');
      });
    });

    context('Menu item with context formatting:bold', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't5',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupFormattingBold(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled when selection is editable', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't5');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't5');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
      });

      it('TINY-11211: Menu item should be disabled in non-editable root', async () => {
        const editor = hook.editor();
        editor.setEditableRoot(false);
        await pClickToolbarAndWait(editor, 't5');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't5');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        editor.setEditableRoot(true);
        await pClickToolbarAndWait(editor, 't5');
        assertButtonEnabled('test');
      });
    });

    context('Menu item with context mode:design, nodeChange setEnabled(false)', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't6',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupNodeChangeSetEnabledFalse(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled when selection is editable', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't6');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't6');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't6');
        assertButtonDisabled('test');
      });
    });

    context('Menu item with context mode:design, nodeChange setEnabled(true)', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't7',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupNodeChangeSetEnabledTrue(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled when selection is editable', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't7');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't7');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't7');
        assertButtonEnabled('test');
      });
    });

    context('Menu item with context mode:design and onSetup buttonApi setEnabled(false) without NodeChange', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't8',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupSetEnabledFalse(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should always be disabled', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't8');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't8');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't8');
        assertButtonDisabled('test');
      });
    });

    context('Menu item with context: doesntmatch', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't9',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupDoesntMatch(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should fallback to design:mode', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't9');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't9');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't9');
        assertButtonEnabled('test');
      });
    });

    context('Menu item with context: insert:span', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't10',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupInsertSpan(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should be enabled when span can be inserted in current selection', async () => {
        const editor = hook.editor();
        await pClickToolbarAndWait(editor, 't10');
        assertButtonEnabled('test');
        await pCloseMenu(editor);

        editor.setContent('<img src="https://picsum.photos/200/300"/>');
        const image = editor.dom.select('img')[0];
        let imageLoaded = false;
        image.onload = () => imageLoaded = true;
        await Waiter.pTryUntilPredicate('Wait for iframe to finish loading', () => imageLoaded);
        editor.selection.select(image);
        await pClickToolbarAndWait(editor, 't10');
        assertButtonDisabled('test');
      });
    });

    context('Menu item with enabled: false', () => {
      afterEach(async () => await pCloseMenu(hook.editor()));
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't11',
        statusbar: false,
        setup: (ed: Editor) => {
          menuButtonSetup.buttonSetupAnyEnabledFalse(ed);
        }
      }, [], true);

      it('TINY-11211: Menu item should always be disabled', async () => {
        const editor = hook.editor();
        // Wait for NodeChange to be processed
        await Waiter.pWait(0);
        await pClickToolbarAndWait(editor, 't11');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('readonly');
        await pClickToolbarAndWait(editor, 't11');
        assertButtonDisabled('test');
        await pCloseMenu(editor);

        editor.mode.set('design');
        await pClickToolbarAndWait(editor, 't11');
        assertButtonDisabled('test');
      });
    });
  });
});
