import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarButtonContextTest', () => {
  const registerMode = (ed: Editor) => {
    ed.mode.register('testmode', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: {
        selectionEnabled: true
      }
    });
  };

  const assertButtonEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const setupNodeChangeHandler = (ed: Editor, handler: () => void) => {
    ed.on('NodeChange', handler);
    handler();
    return () => ed.off('NodeChange', handler);
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
      buttonSetupSetEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => () => api.setEnabled(false) }),
      buttonSetupDoesntMatch: (ed: Editor) => makeButton(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeButton(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeButton(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeButton(ed, { name: 't12', text: 't12', context: 'any', enabled: false }),
      assertButtonEnabled,
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
            registerMode(ed);

            scenario.buttonSetupAny(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in all modes`, async () => {
          const editor = hook.editor();
          scenario.assertButtonEnabled('t1');

          editor.mode.set('testmode');
          scenario.assertButtonEnabled('t1');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t1');

          editor.mode.set('testmode');
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
        });
      });

      context('Toolbar button spec with context: any, switching modes in editor setup ', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't1',
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupAny(ed);
            ed.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupModeDesign(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should not be enabled in design mode only`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t2');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t2');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t2');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupModeDesign(ed);
            ed.mode.set('testmode');
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in design mode only`, async () => {
          const editor = hook.editor();
          scenario.assertButtonDisabled('t2');

          editor.mode.set('readonly');
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
            registerMode(ed);

            scenario.buttonSetupModeReadonly(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in readonly mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t3');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t3');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t3');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t3');

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

      context('Toolbar button spec with context: mode:readonly, switching modes in editor setup ', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't3',
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupModeReadonly(ed);
            ed.mode.set('testmode');
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          scenario.assertButtonDisabled('t3');
          editor.mode.set('readonly');
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
            registerMode(ed);

            scenario.buttonSetupEditable(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled when selection is editable`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t4');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t4');
        });

        it(`TINY-11211: Toolbar ${scenario.label} should be disabled in non-editable root`, async () => {
          const editor = hook.editor();
          editor.setEditableRoot(false);
          editor.mode.set('design');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t4');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupFormattingBold(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled when formatter can be applied`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t5');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t5');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t5');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupNodeChangeSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t6');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t6');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t6');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupNodeChangeSetEnabledTrue(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t7');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t7');

          editor.mode.set('readonly');
          scenario.assertButtonEnabled('t7');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t7');

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
            registerMode(ed);

            scenario.buttonSetupSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be enabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t8');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t8');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t8');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupDoesntMatch(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should fall back to mode:design`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonEnabled('t9');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t9');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t9');

          editor.mode.set('testmode');
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
            registerMode(ed);

            scenario.buttonSetupModeDesign2(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be disabled initially`, async () => {
          const editor = hook.editor();
          scenario.assertButtonDisabled('t10');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t10');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t10');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t10');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t10');

          editor.mode.set('design');
          scenario.assertButtonEnabled('t10');
        });
      });

      context('Toolbar button spec with context insert:tr', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't11',
          statusbar: false,
          setup: (ed: Editor) => {
            registerMode(ed);
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

      context('Toolbar button spec enabled: false', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't12',
          statusbar: false,
          setup: (ed: Editor) => {
            registerMode(ed);
            scenario.buttonSetupAnyEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: Toolbar ${scenario.label} should be stay disabled when enabled: false`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          scenario.assertButtonDisabled('t12');

          editor.mode.set('readonly');
          scenario.assertButtonDisabled('t12');

          editor.mode.set('testmode');
          scenario.assertButtonDisabled('t12');

          editor.mode.set('design');
          scenario.assertButtonDisabled('t12');
        });
      });
    });
  });
});
