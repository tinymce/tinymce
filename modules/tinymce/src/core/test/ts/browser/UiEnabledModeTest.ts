import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ToolbarMode } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.core.UiEnabledModesTest', () => {
  const registerMode = (ed: Editor) => {
    ed.mode.register('testmode', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: {
        uiEnabled: true,
        selectionEnabled: true,
      },
    });
  };

  const assertMenuEnabled = (menu: string) => {
    const menuButton = UiFinder.findIn(SugarBody.body(), `.tox-mbtn:contains("${menu}")`).getOrDie();
    assert.equal(Attribute.get(menuButton, 'disabled'), undefined, 'Should not be disabled');
  };

  const assertMenuDisabled = (menu: string) => {
    const menuButton = UiFinder.findIn(SugarBody.body(), `.tox-mbtn:contains("${menu}")`).getOrDie();
    assert.equal(Attribute.get(menuButton, 'disabled'), 'disabled', 'Should be disabled');
  };

  const assertButtonEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"]:not([aria-disabled="true"])`);

  const assertOverflowButtonDisabled = () => UiFinder.exists(SugarBody.body(), '[data-mce-name="overflow-button"][disabled="disabled"]');

  const assertButtonNativelyDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][disabled="disabled"]`);

  const assertButtonNativelyEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);

  context('Menubar', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 't1 t2 t3 t4',
      statusbar: false,
      menubar: 'file menutest',
      menu: {
        file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
        menutest: { title: 'test', items: 'x1 x2 x3 x4 preferences' }
      },
      setup: (ed: Editor) => {
        registerMode(ed);
      }
    }, [], true);

    it('TINY-10980: Menu bar buttons should always be enabled in uiEnabled mode', () => {
      const editor = hook.editor();

      editor.mode.set('design');
      assertMenuEnabled('File');

      editor.mode.set('testmode');
      assertMenuEnabled('File');

      editor.mode.set('readonly');
      assertMenuDisabled('File');

      editor.mode.set('testmode');
      assertMenuEnabled('File');

      editor.mode.set('design');
      assertMenuEnabled('File');
    });
  });

  Arr.each([
    {
      label: 'Normal menu item',
      setupButtons: (ed: Editor) => {
        ed.ui.registry.addMenuItem('x1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          shortcut: 'Meta+M',
          onAction: Fun.noop
        });

        ed.ui.registry.addMenuItem('x2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          onAction: Fun.noop
        });

        ed.ui.registry.addMenuItem('x3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          onAction: Fun.noop
        });

        ed.ui.registry.addMenuItem('x4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          onAction: Fun.noop
        });
      },
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) =>
        TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    },
    {
      label: 'Nested Menu Item',
      setupButtons: (ed: Editor) => {
        ed.ui.registry.addNestedMenuItem('x1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          shortcut: 'Meta+M',
          getSubmenuItems: Fun.constant('test'),
        });

        ed.ui.registry.addNestedMenuItem('x2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          getSubmenuItems: Fun.constant('test'),
        });

        ed.ui.registry.addNestedMenuItem('x3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          getSubmenuItems: Fun.constant('test'),
        });

        ed.ui.registry.addNestedMenuItem('x4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          getSubmenuItems: Fun.constant('test'),
        });
      },
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    },
    {
      label: 'Toggle Menu Item',
      setupButtons: (ed: Editor) => {
        ed.ui.registry.addToggleMenuItem('x1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          shortcut: 'Meta+M',
          onAction: Fun.noop
        });

        ed.ui.registry.addToggleMenuItem('x2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          onAction: Fun.noop
        });

        ed.ui.registry.addToggleMenuItem('x3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          onAction: Fun.noop
        });

        ed.ui.registry.addToggleMenuItem('x4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          },
          shortcut: 'Meta+M',
          readonly: true,
          onAction: Fun.noop
        });
      },
      pAssertMenuItemDisabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="true"]`),
      pAssertMenuItemEnabled: (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `.tox-collection__item[aria-label="${menuItemLabel}"][aria-disabled="false"]`)
    }
  ], (scenario) => {
    context(scenario.label, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't1 t2 t3 t4',
        statusbar: false,
        menubar: 'file menutest',
        menu: {
          file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
          menutest: { title: 'test', items: 'x1 x2 x3 x4 preferences' }
        },
        setup: (ed: Editor) => {
          registerMode(ed);

          scenario.setupButtons(ed);
        }
      }, [], true);

      it('TINY-10980: Menu item under menu should be disabled', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 1');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 1');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('readonly');
        assertMenuDisabled('test');

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 1');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 1');
        TinyUiActions.keystroke(editor, Keys.escape());
      });

      it('TINY-10980: Menu item should be disabled since setEnabled(true) in onSetup callback but toolbar spec readonly: false', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 2');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 2');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('readonly');
        assertMenuDisabled('test');

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 2');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 2');
        TinyUiActions.keystroke(editor, Keys.escape());
      });

      it('TINY-10980: Menu item should be enabled since setEnabled(true) in onSetup callback and toolbar spec readonly: true', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 3');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 3');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('readonly');
        assertMenuDisabled('test');

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 3');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemEnabled(editor, 'Test Menu Item 3');
        TinyUiActions.keystroke(editor, Keys.escape());
      });

      it('TINY-10980: Menu item should be disabled since setEnabled(false) in onSetup callback and toolbar spec readonly: true', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 4');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 4');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('readonly');
        assertMenuDisabled('test');

        editor.mode.set('testmode');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 4');
        TinyUiActions.keystroke(editor, Keys.escape());

        editor.mode.set('design');
        TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("test")');
        await scenario.pAssertMenuItemDisabled(editor, 'Test Menu Item 4');
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    });
  });

  Arr.each([
    {
      label: 'Normal toolbar button',
      buttonSetupOne: (ed: Editor) => {
        ed.ui.registry.addButton('t1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          onAction: Fun.noop
        });
      },
      buttonSetupTwo: (ed: Editor) => {
        ed.ui.registry.addButton('t2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupThree: (ed: Editor) => {
        ed.ui.registry.addButton('t3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          readonly: true,
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupFour: (ed: Editor) => {
        ed.ui.registry.addButton('t4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          readonly: true,
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          }
        });
      },
      buttonSetupFive: (ed: Editor) => {
        ed.ui.registry.addButton('t4', {
          icon: 'italic',
          text: 'Test Menu Item 5',
          readonly: true,
          onAction: Fun.noop,
        });
      }
    },
    {
      label: 'Toggle toolbar button',
      buttonSetupOne: (ed: Editor) => {
        ed.ui.registry.addToggleButton('t1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          onAction: Fun.noop
        });
      },
      buttonSetupTwo: (ed: Editor) => {
        ed.ui.registry.addToggleButton('t2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupThree: (ed: Editor) => {
        ed.ui.registry.addToggleButton('t3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          readonly: true,
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupFour: (ed: Editor) => {
        ed.ui.registry.addToggleButton('t4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          readonly: true,
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          }
        });
      },
      buttonSetupFive: (ed: Editor) => {
        ed.ui.registry.addToggleButton('t5', {
          icon: 'italic',
          text: 'Test Menu Item 5',
          readonly: true,
          onAction: Fun.noop,
        });
      }
    },
    {
      label: 'Split toolbar button',
      buttonSetupOne: (ed: Editor) => {
        ed.ui.registry.addSplitButton('t1', {
          icon: 'italic',
          text: 'Test Menu Item 1',
          onAction: Fun.noop,
          fetch: (success) => {
            success([
              {
                text: 'Choice item 1',
                type: 'choiceitem',
              }
            ]);
          },
          onItemAction: Fun.noop
        });
      },
      buttonSetupTwo: (ed: Editor) => {
        ed.ui.registry.addSplitButton('t2', {
          icon: 'italic',
          text: 'Test Menu Item 2',
          onAction: Fun.noop,
          onItemAction: Fun.noop,
          fetch: (success) => {
            success([
              {
                text: 'Choice item 1',
                type: 'choiceitem',
              }
            ]);
          },
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupThree: (ed: Editor) => {
        ed.ui.registry.addSplitButton('t3', {
          icon: 'italic',
          text: 'Test Menu Item 3',
          readonly: true,
          onAction: Fun.noop,
          onItemAction: Fun.noop,
          fetch: (success) => {
            success([
              {
                text: 'Choice item 1',
                type: 'choiceitem',
              }
            ]);
          },
          onSetup: (api) => {
            api.setEnabled(true);
            return Fun.noop;
          }
        });
      },
      buttonSetupFour: (ed: Editor) => {
        ed.ui.registry.addSplitButton('t4', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          readonly: true,
          onAction: Fun.noop,
          onSetup: (api) => {
            api.setEnabled(false);
            return Fun.noop;
          },
          onItemAction: Fun.noop,
          fetch: (success) => {
            success([
              {
                text: 'Choice item 1',
                type: 'choiceitem',
              }
            ]);
          },
        });
      },
      buttonSetupFive: (ed: Editor) => {
        ed.ui.registry.addSplitButton('t5', {
          icon: 'italic',
          text: 'Test Menu Item 5',
          readonly: true,
          onAction: Fun.noop,
          onItemAction: Fun.noop,
          fetch: (success) => {
            success([
              {
                text: 'Choice item 1',
                type: 'choiceitem',
              }
            ]);
          },
        });
      }
    },
  ], (scenario) => {
    context(scenario.label, () => {
      context('onSetup callback and toolbar button spec readonly property not present', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't1',
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupOne(ed);
          }
        }, [], true);

        it(`TINY-10980: Toolbar ${scenario.label} should be disabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          assertButtonEnabled('t1');

          editor.mode.set('testmode');
          assertButtonDisabled('t1');

          editor.mode.set('readonly');
          assertButtonDisabled('t1');

          editor.mode.set('testmode');
          assertButtonDisabled('t1');

          editor.mode.set('design');
          assertButtonEnabled('t1');
        });
      });

      context('onSetup callback with setEnabled(true) and toolbar button readonly: false', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't2',
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupTwo(ed);
          }
        }, [], true);

        it(`TINY-10980: Toolbar ${scenario.label} should not be enabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          assertButtonEnabled('t2');

          editor.mode.set('testmode');
          assertButtonDisabled('t2');

          editor.mode.set('readonly');
          assertButtonDisabled('t2');

          editor.mode.set('testmode');
          assertButtonDisabled('t2');

          editor.mode.set('design');
          assertButtonEnabled('t2');
        });
      });

      context('onSetup callback with setEnabled(true) and toolbar button readonly: true', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't3',
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupThree(ed);
          }
        }, [], true);

        it(`TINY-10980: Toolbar ${scenario.label} should be enabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          assertButtonEnabled('t3');
          UiFinder.exists(SugarBody.body(), '[data-mce-name="t3"][aria-disabled="false"]');

          editor.mode.set('testmode');
          assertButtonEnabled('t3');

          editor.mode.set('readonly');
          assertButtonDisabled('t3');

          editor.mode.set('testmode');
          assertButtonEnabled('t3');

          editor.mode.set('design');
          assertButtonEnabled('t3');
        });
      });

      context('onSetup callback with setEnabled(false) and toolbar button readonly: true', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't4',
          statusbar: false,
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupFour(ed);
          }
        }, [], true);

        it(`TINY-10980: Toolbar ${scenario.label} should be disabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          assertButtonDisabled('t4');

          editor.mode.set('testmode');
          assertButtonDisabled('t4');

          editor.mode.set('readonly');
          assertButtonDisabled('t4');

          editor.mode.set('testmode');
          assertButtonDisabled('t4');

          // Switching mode when the overflow toolbar is opened, the onSetup callback is not executed hence all buttons are enabled
          editor.mode.set('design');
          assertButtonEnabled('t4');
        });
      });

      context('onSetup callback not present and toolbar button readonly: true', () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: 't5',
          statusbar: false,
          setup: (ed: Editor) => {
            registerMode(ed);

            scenario.buttonSetupFive(ed);
          }
        }, [], true);

        it(`TINY-10980: Toolbar ${scenario.label} should be enabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          assertButtonEnabled('t5');

          editor.mode.set('testmode');
          assertButtonEnabled('t5');

          editor.mode.set('readonly');
          assertButtonDisabled('t5');

          editor.mode.set('testmode');
          assertButtonEnabled('t5');

          // Switching mode when the overflow toolbar is opened, the onSetup callback is not executed hence all buttons are enabled
          editor.mode.set('design');
          assertButtonEnabled('t5');
        });
      });
    });
  });

  context('Menu toolbar button', () => {
    context('onSetup callback and toolbar button spec readonly property not present', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't1',
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addMenuButton('t1', {
            icon: 'italic',
            text: 'Test Menu Item 1',
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'menuitem',
                }
              ]);
            },
          });
        }
      }, [], true);

      it('TINY-10980: Toolbar menu button should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        assertButtonNativelyEnabled('t1');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t1');

        editor.mode.set('readonly');
        assertButtonNativelyDisabled('t1');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t1');

        editor.mode.set('design');
        assertButtonNativelyEnabled('t1');
      });
    });

    context('onSetup callback with setEnabled(true) and toolbar button readonly: false', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't2',
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addMenuButton('t2', {
            icon: 'italic',
            text: 'Test Menu Item 2',
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'menuitem',
                }
              ]);
            },
            onSetup: (api) => {
              api.setEnabled(true);
              return Fun.noop;
            }
          });
        }
      }, [], true);

      it('TINY-10980: Toolbar menu button should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        assertButtonNativelyEnabled('t2');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t2');

        editor.mode.set('readonly');
        assertButtonNativelyDisabled('t2');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t2');

        editor.mode.set('design');
        assertButtonNativelyEnabled('t2');
      });
    });

    context('onSetup callback with setEnabled(true) and toolbar button readonly: true', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't3',
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addMenuButton('t3', {
            icon: 'italic',
            text: 'Test Menu Item 3',
            readonly: true,
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'menuitem',
                }
              ]);
            },
            onSetup: (api) => {
              api.setEnabled(true);
              return Fun.noop;
            }
          });
        }
      }, [], true);

      it('TINY-10980: Toolbar menu button should be enabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        assertButtonNativelyEnabled('t3');

        editor.mode.set('testmode');
        assertButtonNativelyEnabled('t3');

        editor.mode.set('readonly');
        assertButtonNativelyDisabled('t3');

        editor.mode.set('testmode');
        assertButtonNativelyEnabled('t3');

        editor.mode.set('design');
        assertButtonNativelyEnabled('t3');
      });
    });

    context('onSetup callback with setEnabled(false) and toolbar button readonly: true', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 't4',
        statusbar: false,
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addMenuButton('t4', {
            icon: 'italic',
            text: 'Test Menu Item 4',
            readonly: true,
            onSetup: (api) => {
              api.setEnabled(false);
              return Fun.noop;
            },
            fetch: (success) => {
              success([
                {
                  text: 'Choice item 1',
                  type: 'menuitem',
                }
              ]);
            },
          });
        }
      }, [], true);

      it('TINY-10980: Toolbar menu button should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        assertButtonNativelyDisabled('t4');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t4');

        editor.mode.set('readonly');
        assertButtonNativelyDisabled('t4');

        editor.mode.set('testmode');
        assertButtonNativelyDisabled('t4');

        editor.mode.set('design');
        assertButtonNativelyEnabled('t4');
      });
    });
  });

  context('Bespoke buttons', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'fontsizeinput align fontfamily fontsize blocks styles',
      statusbar: false,
      setup: (ed: Editor) => {
        registerMode(ed);
      }
    }, [], true);

    Arr.each([
      { label: 'Align', selector: 'align' },
      { label: 'Font family', selector: 'fontfamily' },
      { label: 'Font size', selector: 'fontsize' },
      { label: 'Blocks', selector: 'blocks' },
      { label: 'Styles', selector: 'styles' },
    ], (scenario) => {
      it(`TINY-10980: ${scenario.label} should be disabled in uiEnabled mode`, () => {
        const editor = hook.editor();

        editor.mode.set('design');
        assertButtonNativelyEnabled(scenario.selector);

        editor.mode.set('testmode');
        assertButtonNativelyDisabled(scenario.selector);

        editor.mode.set('readonly');
        assertButtonNativelyDisabled(scenario.selector);

        editor.mode.set('testmode');
        assertButtonNativelyDisabled(scenario.selector);

        editor.mode.set('design');
        assertButtonNativelyEnabled(scenario.selector);
      });
    });
  });

  context('Floating overflow toolbar button', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: Arr.range(20, Fun.constant('t1')).join(' '),
      statusbar: false,
      setup: (ed: Editor) => {
        registerMode(ed);

        ed.ui.registry.addButton('t1', {
          icon: 'italic',
          text: 'Test Menu Item 4',
          onAction: Fun.noop
        });
      }
    }, [], true);

    it('TINY-10980: Overflow more toolbar button should be enabled in uiEnabled mode', async () => {
      const editor = hook.editor();
      editor.mode.set('design');
      assertButtonNativelyEnabled('overflow-button');

      editor.mode.set('testmode');
      assertButtonNativelyEnabled('overflow-button');

      editor.mode.set('readonly');
      assertButtonNativelyDisabled('overflow-button');

      editor.mode.set('testmode');
      assertButtonNativelyEnabled('overflow-button');

      editor.mode.set('design');
      assertButtonNativelyEnabled('overflow-button');
    });
  });

  context('Floating overflow toolbar', () => {
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

    context('onSetup callback and toolbar button spec readonly property not present', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(20, Fun.constant('t1')).join(' '),
        statusbar: false,
        toolbar_mode: 'floating',
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addButton('t1', {
            icon: 'italic',
            text: 'Test Menu Item 4',
            onAction: Fun.noop
          });
        }
      }, [], true);

      it('TINY-10980: Buttons under overflow toolbar should be disabled', async () => {
        const editor = hook.editor();
        await pOpenOverflowToolbar(editor);
        editor.mode.set('design');
        assertButtonEnabled('t1');

        editor.mode.set('testmode');
        assertButtonDisabled('t1');

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        assertButtonDisabled('t1');

        editor.mode.set('design');
        assertButtonEnabled('t1');
        closeOverflowToolbar(editor);
      });

      it('TINY-10980: Switching mode when overflow toolbar is closed - buttons should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t1');
        closeOverflowToolbar(editor);

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t1');
        closeOverflowToolbar(editor);

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t1');
        closeOverflowToolbar(editor);

        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t1');
        closeOverflowToolbar(editor);
      });
    });

    context('onSetup callback with setEnabled(true) and toolbar button readonly: false', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(30, Fun.constant('t2')).join(' '),
        toolbar_mode: 'floating',
        statusbar: false,
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addButton('t2', {
            icon: 'italic',
            text: 'Test Menu Item 2',
            onAction: Fun.noop,
            onSetup: (api) => {
              api.setEnabled(true);
              return Fun.noop;
            }
          });
        }
      }, [], true);

      it('TINY-10980: Buttons under overflow toolbar should be disabled', async () => {
        const editor = hook.editor();
        await pOpenOverflowToolbar(editor);
        editor.mode.set('design');
        assertButtonEnabled('t2');

        editor.mode.set('testmode');
        assertButtonDisabled('t2');

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        assertButtonDisabled('t2');

        editor.mode.set('design');
        assertButtonEnabled('t2');
        closeOverflowToolbar(editor);
      });

      it('TINY-10980: Switching mode when overflow toolbar is closed - buttons should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t2');
        closeOverflowToolbar(editor);

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t2');
        closeOverflowToolbar(editor);

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t2');
        closeOverflowToolbar(editor);

        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t2');
        closeOverflowToolbar(editor);
      });
    });

    context('onSetup callback with setEnabled(true) and toolbar button readonly: true', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(20, Fun.constant('t3')).join(' '),
        toolbar_mode: 'floating',
        statusbar: false,
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addButton('t3', {
            icon: 'italic',
            text: 'Test Menu Item 3',
            readonly: true,
            onAction: Fun.noop,
            onSetup: (api) => {
              api.setEnabled(true);
              return Fun.noop;
            }
          });
        }
      }, [], true);

      it('TINY-10980: Buttons under overflow toolbar should be enabled', async () => {
        const editor = hook.editor();
        await pOpenOverflowToolbar(editor);
        editor.mode.set('design');
        assertButtonEnabled('t3');

        editor.mode.set('testmode');
        assertButtonEnabled('t3');

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        assertButtonEnabled('t3');

        editor.mode.set('design');
        assertButtonEnabled('t3');
        closeOverflowToolbar(editor);
      });

      it('TINY-10980: Switching mode when overflow toolbar is closed - buttons should be enabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t3');
        closeOverflowToolbar(editor);

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t3');
        closeOverflowToolbar(editor);

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t3');
        closeOverflowToolbar(editor);

        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonEnabled('t3');
        closeOverflowToolbar(editor);
      });
    });

    context('onSetup callback with setEnabled(false) and toolbar button readonly: true', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(20, Fun.constant('t4')).join(' '),
        toolbar_mode: 'floating',
        statusbar: false,
        setup: (ed: Editor) => {
          registerMode(ed);

          ed.ui.registry.addButton('t4', {
            icon: 'italic',
            text: 'Test Menu Item 4',
            readonly: true,
            onAction: Fun.noop,
            onSetup: (api) => {
              api.setEnabled(false);
              return Fun.noop;
            }
          });
        }
      }, [], true);

      it('TINY-10980: Buttons under overflow toolbar should be disabled', async () => {
        const editor = hook.editor();
        await pOpenOverflowToolbar(editor);
        editor.mode.set('design');
        assertButtonDisabled('t4');

        editor.mode.set('testmode');
        assertButtonDisabled('t4');

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        assertButtonDisabled('t4');

        editor.mode.set('design');
        assertButtonEnabled('t4');
        closeOverflowToolbar(editor);
      });

      it('TINY-10980: Switching mode when overflow toolbar is closed - buttons should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t4');
        closeOverflowToolbar(editor);

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t4');
        closeOverflowToolbar(editor);

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t4');
        closeOverflowToolbar(editor);

        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertButtonDisabled('t4');
        closeOverflowToolbar(editor);
      });
    });

    Arr.each([
      { label: 'Align', selector: 'align' },
      { label: 'Font size', selector: 'fontsize' },
      { label: 'Font Family', selector: 'fontfamily' },
      { label: 'Blocks', selector: 'blocks' },
      { label: 'Styles', selector: 'styles' },
    ], (scenario) => {
      context(scenario.label, () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          toolbar: Arr.range(35, Fun.constant(scenario.selector)).join(' '),
          setup: (ed: Editor) => {
            registerMode(ed);
          }
        }, [], true);

        it(`TINY-10980: ${scenario.label} bespoke button should be disabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          await pOpenOverflowToolbar(editor);
          editor.mode.set('design');
          assertButtonNativelyEnabled(scenario.selector);

          editor.mode.set('testmode');
          assertButtonNativelyDisabled(scenario.selector);

          editor.mode.set('readonly');
          assertOverflowButtonDisabled();

          editor.mode.set('testmode');
          assertButtonNativelyDisabled(scenario.selector);

          editor.mode.set('design');
          assertButtonNativelyEnabled(scenario.selector);
          closeOverflowToolbar(editor);
        });

        it(`TINY-10980: Switching mode when overflow toolbar is closed - ${scenario.label} bespoke button should be disabled in uiEnabled mode`, async () => {
          const editor = hook.editor();
          editor.mode.set('design');
          await pOpenOverflowToolbar(editor);
          assertButtonNativelyEnabled(scenario.selector);
          closeOverflowToolbar(editor);

          editor.mode.set('testmode');
          await pOpenOverflowToolbar(editor);
          assertButtonNativelyDisabled(scenario.selector);
          closeOverflowToolbar(editor);

          editor.mode.set('readonly');
          assertOverflowButtonDisabled();

          editor.mode.set('testmode');
          await pOpenOverflowToolbar(editor);
          assertButtonNativelyDisabled(scenario.selector);
          closeOverflowToolbar(editor);

          editor.mode.set('design');
          await pOpenOverflowToolbar(editor);
          assertButtonNativelyEnabled(scenario.selector);
          closeOverflowToolbar(editor);
        });
      });
    });

    context('Fontsizeinput', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: Arr.range(20, Fun.constant('fontsizeinput')).join(' '),
        setup: (ed: Editor) => {
          registerMode(ed);
        }
      }, [], true);

      const assertFontSizeInputDisabled = () => {
        assertButtonNativelyDisabled('minus');
        assertButtonNativelyDisabled('plus');
        UiFinder.exists(SugarBody.body(), `[data-mce-name="fontsizeinput"]  input[disabled="disabled"]`);
      };

      const assertFontSizeInputEnabled = () => {
        assertButtonNativelyEnabled('minus');
        assertButtonNativelyEnabled('plus');
        UiFinder.notExists(SugarBody.body(), `[data-mce-name="fontsizeinput"] input[disabled="disabled"]`);
      };

      it(`TINY-10980: Fontsizeinput bespoke button should be disabled in uiEnabled mode`, async () => {
        const editor = hook.editor();
        await pOpenOverflowToolbar(editor);
        editor.mode.set('design');
        assertFontSizeInputEnabled();

        editor.mode.set('testmode');
        assertFontSizeInputDisabled();

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        assertFontSizeInputDisabled();

        editor.mode.set('design');
        assertFontSizeInputEnabled();
        closeOverflowToolbar(editor);
      });

      it('TINY-10980: Switching mode when overflow toolbar is closed - fontsizeinput bespoke button should be disabled in uiEnabled mode', async () => {
        const editor = hook.editor();
        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertFontSizeInputEnabled();
        closeOverflowToolbar(editor);

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertFontSizeInputDisabled();
        closeOverflowToolbar(editor);

        editor.mode.set('readonly');
        assertOverflowButtonDisabled();

        editor.mode.set('testmode');
        await pOpenOverflowToolbar(editor);
        assertFontSizeInputDisabled();
        closeOverflowToolbar(editor);

        editor.mode.set('design');
        await pOpenOverflowToolbar(editor);
        assertFontSizeInputEnabled();
        closeOverflowToolbar(editor);
      });
    });
  });
});
