import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.EditorMenuItemContextTest', () => {
  const assertMenuEnabled = (menu: string) => {
    const menuButton = UiFinder.findIn(SugarBody.body(), `.tox-mbtn:contains("${menu}")`).getOrDie();
    assert.equal(Attribute.get(menuButton, 'disabled'), undefined, 'Should be disabled');
  };

  const setupNodeChangeHandler = (ed: Editor, handler: () => void) => {
    ed.on('NodeChange', handler);
    handler();
    return () => ed.off('NodeChange', handler);
  };

  const makeButton = (ed: Editor, spec: { name: string; text: string; context: string; onSetup?: (api: any) => (api: any) => void; enabled?: boolean }) => {
    ed.ui.registry.addMenuItem(spec.name, {
      icon: 'italic',
      text: spec.text,
      onAction: Fun.noop,
      onSetup: spec.onSetup,
      context: spec.context,
      enabled: spec.enabled
    });
  };

  const makeNestedMenuItem = (ed: Editor, spec: { name: string; text: string; context: string; onSetup?: (api: any) => (api: any) => void; enabled?: boolean }) => {
    ed.ui.registry.addNestedMenuItem(spec.name, {
      icon: 'italic',
      text: spec.text,
      onSetup: spec.onSetup,
      context: spec.context,
      enabled: spec.enabled,
      getSubmenuItems: Fun.constant('test')
    });
  };

  const makeToggleMenuItem = (ed: Editor, spec: { name: string; text: string; context: string; onSetup?: (api: any) => (api: any) => void; enabled?: boolean }) => {
    ed.ui.registry.addToggleMenuItem(spec.name, {
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
      label: 'Normal menu item',
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
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) =>
        TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    },
    {
      label: 'Toggle menu item',
      buttonSetupAny: (ed: Editor) => makeToggleMenuItem(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeToggleMenuItem(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeToggleMenuItem(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeToggleMenuItem(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeToggleMenuItem(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeToggleMenuItem(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeToggleMenuItem(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeToggleMenuItem(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeToggleMenuItem(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeToggleMenuItem(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeToggleMenuItem(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeToggleMenuItem(ed, { name: 't12', text: 't12', context: 'mode:design', enabled: false }),
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    },
    {
      label: 'Nested menu item',
      buttonSetupAny: (ed: Editor) => makeNestedMenuItem(ed, { name: 't1', text: 't1', context: 'any' }),
      buttonSetupModeDesign: (ed: Editor) => makeNestedMenuItem(ed, { name: 't2', text: 't2', context: 'mode:design' }),
      buttonSetupModeReadonly: (ed: Editor) => makeNestedMenuItem(ed, { name: 't3', text: 't3', context: 'mode:readonly' }),
      buttonSetupEditable: (ed: Editor) => makeNestedMenuItem(ed, { name: 't4', text: 't4', context: 'editable' }),
      buttonSetupFormattingBold: (ed: Editor) => makeNestedMenuItem(ed, { name: 't5', text: 't5', context: 'formatting:bold' }),
      buttonSetupNodeChangeSetEnabledFalse: (ed: Editor) => makeNestedMenuItem(ed, { name: 't6', text: 't6', context: 'mode:design', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(false)) }),
      buttonSetupNodeChangeSetEnabledTrue: (ed: Editor) => makeNestedMenuItem(ed, { name: 't7', text: 't7', context: 'mode:readonly', onSetup: (api) => setupNodeChangeHandler(ed, () => api.setEnabled(true)) }),
      buttonSetupSetEnabledFalse: (ed: Editor) => makeNestedMenuItem(ed, { name: 't8', text: 't8', context: 'mode:design', onSetup: (api) => {
        api.setEnabled(false);
        return Fun.noop;
      } }),
      buttonSetupDoesntMatch: (ed: Editor) => makeNestedMenuItem(ed, { name: 't9', text: 't9', context: 'doesntmatch' }),
      buttonSetupModeDesign2: (ed: Editor) => makeNestedMenuItem(ed, { name: 't10', text: 't10', context: 'mode:design' }),
      buttonSetupInsertSpan: (ed: Editor) => makeNestedMenuItem(ed, { name: 't11', text: 't11', context: 'insert:span' }),
      buttonSetupAnyEnabledFalse: (ed: Editor) => makeNestedMenuItem(ed, { name: 't12', text: 't12', context: 'mode:design', enabled: false }),
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    },
  ];

  Arr.each(setupButtonsScenario, (scenario) => {
    context(scenario.label, () => {
      context('Menu item spec with context: any', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupAny(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled in all modes`, async () => {
          const editor = hook.editor();
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());
        });

        it(`TINY-11211: ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(false);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(true);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: any, switching modes in editor setup', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupAny(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled in all modes`, async () => {
          const editor = hook.editor();
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't1');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context mode:design', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should only be enabled in design mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());
        });

        it(`TINY-11211: ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(false);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:design, switching modes in editor setup ', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled in design mode only`, async () => {
          const editor = hook.editor();
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't2');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:readonly', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupModeReadonly(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled in readonly mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());
        });

        it(`TINY-11211: ${scenario.label} should be enabled in noneditable selection`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>a</p>');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(false);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:readonly, switching modes in editor setup', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          setup: (ed: Editor) => {
            scenario.buttonSetupModeReadonly(ed);
            ed.mode.set('readonly');
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should only be enabled in readonly mode`, async () => {
          const editor = hook.editor();
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't3');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: editable', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupEditable(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled when selection is editable`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());
        });

        it(`TINY-11211: ${scenario.label} should be disabled in non-editable root`, async () => {
          const editor = hook.editor();
          editor.setEditableRoot(false);
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(true);
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't4');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: formatting:bold', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupFormattingBold(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be enabled when formatter can be applied`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());
        });

        it(`TINY-11211: ${scenario.label} should not be enabled when formatter cannot be applied`, async () => {
          const editor = hook.editor();
          editor.setContent('<p>test</p>');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(false);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setEditableRoot(true);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't5');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:design and onSetup buttonApi setEnabled(false)', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupNodeChangeSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't6');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't6');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          // This is different from the toolbar since these always run when the menu button is clicked,
          // so the setEnabled is executed when the menu is attached.
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't6');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:readonly and onSetup buttonApi setEnabled(true)', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupNodeChangeSetEnabledTrue(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} buttonApi.setEnabled should overwrite the context`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't7');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't7');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't7');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: mode:design and onSetup buttonApi setEnabled(false), without NodeChange', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupSetEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should always be disabled`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't8');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't8');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't8');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context: doesntmatch, should fallback to default mode:design', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupDoesntMatch(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should fall back to mode:design`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't9');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't9');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't9');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec with context mode:design, readonly: true editor option', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          readonly: true,
          setup: (ed: Editor) => {
            scenario.buttonSetupModeDesign2(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be disabled initially`, async () => {
          hook.editor();
          assertMenuEnabled('test');
        });
      });

      context('Menu item spec with context insert:tr', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupInsertSpan(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be disabled initially`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemEnabled(editor, 't11');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.setContent('<img src="https://picsum.photos/200/300"/>');
          const image = editor.dom.select('img')[0];
          let imageLoaded = false;
          image.onload = () => imageLoaded = true;
          await Waiter.pTryUntilPredicate('Wait for iframe to finish loading', () => imageLoaded);
          editor.selection.select(image);
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't11');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });

      context('Menu item spec enabled: false', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          menubar: 'file menutest',
          menu: {
            file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
            menutest: { title: 'test', items: 't1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 preferences' }
          },
          statusbar: false,
          setup: (ed: Editor) => {
            scenario.buttonSetupAnyEnabledFalse(ed);
          }
        }, [], true);

        it(`TINY-11211: ${scenario.label} should be stay disabled when enabled: false`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't12');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('readonly');
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't12');
          TinyUiActions.keystroke(editor, Keys.escape());

          editor.mode.set('design');
          // This is also differs from the toolbar button since the onAttached is fired
          TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
          await scenario.pAssertMenuItemDisabled(editor, 't12');
          TinyUiActions.keystroke(editor, Keys.escape());
        });
      });
    });
  });
});
