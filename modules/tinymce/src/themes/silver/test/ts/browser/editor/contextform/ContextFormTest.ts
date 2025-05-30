import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun, Obj } from '@ephox/katamari';
import { Attribute, SugarBody, SugarDocument, Value } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.themes.silver.editor.ContextFormTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextForm('test-form', {
        placeholder: 'This is a placeholder',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC',
          onSetup: (buttonApi) => {
            const f = (evt: { active?: boolean; disable?: boolean }) => {
              if (Obj.has(evt, 'disable')) {
                buttonApi.setEnabled(!evt.disable as boolean);
              } else if (Obj.has(evt, 'active')) {
                buttonApi.setActive(evt.active as boolean);
              }
            };

            ed.on('test.updateButtonABC', f);

            return () => {
              ed.off('test.updateButtonABC', f);
            };
          }
        },
        onSetup: (_) => {
          store.add('setup');
          return () => {
            store.add('teardown');
          };
        },
        onInput: (formApi) => store.add(`input.${formApi.getValue()}`),
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        commands: [
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'A',
            onSetup: (buttonApi) => {
              const f = (evt: { active?: boolean; disable?: boolean }) => {
                if (Obj.has(evt, 'disable')) {
                  buttonApi.setEnabled(!evt.disable);
                }
              };

              ed.on('test.updateButtonA', f);

              return () => {
                ed.off('test.updateButtonA', f);
              };
            },
            onAction: (formApi, _buttonApi) => store.adder('A.' + formApi.getValue())()
          },
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'B',
            primary: true,
            onAction: (formApi, _buttonApi) => store.adder('B.' + formApi.getValue())()
          },
          {
            type: 'contextformtogglebutton',
            icon: 'fake-icon-name',
            tooltip: 'C',
            onSetup: (buttonApi) => {
              const f = (evt: { active?: boolean; disable?: boolean }) => {
                if (Obj.has(evt, 'disable')) {
                  buttonApi.setEnabled(!evt.disable as boolean);
                } else if (Obj.has(evt, 'active')) {
                  buttonApi.setActive(evt.active as boolean);
                }
              };

              ed.on('test.updateButtonC', f);

              return () => {
                ed.off('test.updateButtonC', f);
              };
            },
            onAction: (formApi, _buttonApi) => store.adder('C.' + formApi.getValue())()
          },
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'D',
            onAction: (formApi, _buttonApi) => {
              formApi.setValue('before-hide');
              formApi.hide();
              store.add('D.' + formApi.getValue());
              formApi.setValue('after-hide');
              store.add('D.' + formApi.getValue());
            }
          },
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'E',
            onAction: (formApi, _buttonApi) => {
              formApi.setInputEnabled(!formApi.isInputEnabled());
            }
          },
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'F',
            onAction: (formApi, _buttonApi) => {
              formApi.back();
            }
          },
        ]
      });

      ed.ui.registry.addContextForm('get-value-after-component-detach-form', {
        type: 'contextsizeinputform',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC',
        },
        onSetup: (api) => {
          api.setValue({ width: '300', height: '300' });
          store.add('setup');

          return () => {
            store.add('teardown');
            setTimeout(() => {
              store.add(api.getValue()?.width + 'x' + api.getValue()?.height);
            });
          };
        },
        predicate: Fun.never,
        commands: [],
      });

      ed.ui.registry.addContextForm('set-value-after-component-detach-form', {
        type: 'contextsizeinputform',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC',
        },
        onSetup: (api) => {
          api.setValue({ width: '300', height: '300' });
          store.add('setup');

          return () => {
            store.add('teardown');
            setTimeout(() => {
              api.setValue({ width: '500', height: '500' });
              store.add(api.getValue()?.width + 'x' + api.getValue()?.height);
            });
          };
        },
        predicate: Fun.never,
        commands: [],
      });

      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: Fun.never,
        items: 'form:test-form',
      });

      ed.ui.registry.addContextForm('test-form-focus-on-init', {
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'Focus on init',
        },
        commands: [{
          type: 'contextformbutton',
          icon: 'fake-icon-name',
          tooltip: 'A',
          onAction: (formApi) => {
            formApi.setInputEnabled(false);
            return Fun.noop;
          }
        }]
      });

      ed.ui.registry.addContextToolbar('test-toolbar-focus-on-init', {
        predicate: Fun.never,
        items: 'form:test-form-focus-on-init',
      });

      ed.ui.registry.addContextForm('test-form-disable-on-setup', {
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'Focus on init',
        },
        onSetup: (api) => {
          api.setInputEnabled(false);
          return Fun.noop;
        },
        commands: [{
          type: 'contextformbutton',
          icon: 'fake-icon-name',
          tooltip: 'A',
          onAction: (formApi) => {
            formApi.setInputEnabled(false);
            return Fun.noop;
          }
        }]
      });

      ed.ui.registry.addContextToolbar('test-toolbar-disable-on-setup', {
        predicate: Fun.never,
        items: 'test-form-disable-on-setup',
      });
    }
  }, [], true);

  afterEach(async () => {
    const editor = hook.editor();

    editor.focus();

    // Simulate clicking elsewhere in the editor
    clickAway(editor);
    await pAssertNoPopDialog();

    store.clear();
  });

  const openToolbar = (editor: Editor, toolbarKey: string) => {
    editor.dispatch('contexttoolbar-show', {
      toolbarKey
    });
  };

  const checkLastButtonGroup = (label: string, children: ApproxStructure.Builder<StructAssert[]>) => {
    const groups = UiFinder.findAllIn(SugarBody.body(), '.tox-pop .tox-toolbar__group');
    if (groups.length === 0) {
      throw new Error('Cannot find any toolbar group');
    }
    const group = groups[groups.length - 1];
    Assertions.assertStructure(
      label,
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: children(s, str, arr)
      })),
      group
    );
  };

  const hasDialog = (label: string) => {
    const toolbar = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    Assertions.assertStructure(
      `${label}: Checking pop has a dialog`,
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        classes: [ arr.has('tox-pop') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-pop__dialog') ]
          })
        ]
      })),
      toolbar
    );
  };

  const clickAway = (editor: Editor) => {
    // <a> tags make the context bar appear so click away from an a tag. We have no content so it's probably fine.
    TinySelections.setCursor(editor, [ ], 0);
    Mouse.trueClick(TinyDom.body(editor));
  };

  const pAssertNoPopDialog = () => Waiter.pTryUntil(
    'Pop dialog should disappear (soon)',
    () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
  );

  it('TBA: Immediately launching a context form, and navigating and triggering enter and esc', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    openToolbar(editor, 'test-form');
    await FocusTools.pTryOnSelector('Focus should now be on input in context form', doc, 'input');
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should now be on button "A" in the context form', doc, 'button[aria-label="A"]');
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should go back to input in context form', doc, 'input');
    FocusTools.setActiveValue(doc, 'Words');
    TinyUiActions.keydown(editor, Keys.enter());
    store.assertEq('B should have fired because it is primary', [ 'setup', 'input.Words', 'B.Words' ]);
    hasDialog('Immediate context form should have an inner dialog class');
    TinyUiActions.keyup(editor, Keys.escape());
    // Check that the context popup still exists;
    UiFinder.exists(SugarBody.body(), '.tox-pop');
    await Waiter.pTryUntil('Check that the editor still has focus', () => editor.hasFocus());
  });

  it('TBA: Launch a context form from a context toolbar', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    openToolbar(editor, 'test-toolbar');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button');
    hasDialog('Initial context toolbar should have an inner dialog class');
    TinyUiActions.keydown(editor, Keys.enter());
    await FocusTools.pTryOnSelector('Focus should now be on input in context form that was launched by button', doc, 'input');
    hasDialog('Launched context form should have an inner dialog class');
    TinyUiActions.keyup(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Focus should have shifted back to the triggering toolbar', doc, '.tox-pop button');
    hasDialog('Restored context toolbar (esc from form) should have an inner dialog class');
    TinyUiActions.keyup(editor, Keys.escape());
    // Check that the context popup still exists;
    UiFinder.exists(SugarBody.body(), '.tox-pop');
    await Waiter.pTryUntil('Check that the editor still has focus', () => editor.hasFocus());
  });

  it('TBA: Launching context form does not work if the context toolbar launcher is disabled', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-toolbar');
    editor.dispatch('test.updateButtonABC', { disable: true });
    checkLastButtonGroup('Checking button is disabled after event', (s, str, arr) => [
      s.element('button', {
        classes: [ arr.has('tox-tbtn--disabled') ],
        attrs: { 'aria-disabled': str.is('true') }
      })
    ]);
    editor.dispatch('test.updateButtonABC', { disable: false });
    checkLastButtonGroup('Checking button is re-enabled after event', (s, _str, arr) => [
      s.element('button', {
        classes: [ arr.not('tox-tbtn--disabled') ]
      })
    ]);

    editor.dispatch('test.updateButtonABC', { active: true });
    checkLastButtonGroup('Checking button is pressed after event', (s, str, _arr) => [
      s.element('button', {
        attrs: {
          'aria-pressed': str.is('true')
        }
      })
    ]);

    editor.dispatch('test.updateButtonABC', { active: false });
    checkLastButtonGroup('Checking button is *not* pressed after event', (s, str, _arr) => [
      s.element('button', {
        attrs: {
          'aria-pressed': str.is('false')
        }
      })
    ]);
  });

  it('TBA: Checking that context form buttons have a working disabled/active api', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    editor.dispatch('test.updateButtonA', { disable: true });
    editor.dispatch('test.updateButtonC', { active: true });
    checkLastButtonGroup('Checking buttons have right state', (s, str, arr) => [
      s.element('button', { classes: [ arr.has('tox-tbtn--disabled') ], attrs: { 'aria-disabled': str.is('true') }}),
      s.element('button', { classes: [ arr.not('tox-tbtn--disabled') ] }),
      s.element('button', { attrs: { 'aria-pressed': str.is('true') }}),
      s.element('button', { classes: [ arr.not('tox-tbtn--disabled') ] }),
      s.element('button', { classes: [ arr.not('tox-tbtn--disabled') ] }),
      s.element('button', { classes: [ arr.not('tox-tbtn--disabled') ] })
    ]);
  });

  it('TINY-11342: Should enable/disable input when calling setInputEnabled and read the state using isInputEnabled', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="E"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-pop input:disabled');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="E"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-pop input:not(:disabled)');
  });

  it('TINY-11494: Opening context form should trigger onSetup', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    await Waiter.pTryUntil(
      'Toolbar should be opened',
      () => UiFinder.exists(SugarBody.body(), '.tox-pop input')
    );
    store.assertEq('Opening contex slider form should trigger onSetup', [ 'setup' ]);
  });

  it('TINY-11342: Input event should trigger onInput', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop input').getOrDie();
    Value.set(input, 'Hello');
    input.dom.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    store.assertEq('Input should trigger onInput', [ 'setup', 'input.Hello' ]);
  });

  it('TINY-11342: Should be able to get value after the context form has been hidden', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="D"]');
    store.assertEq('D should have fired', [ 'setup', 'teardown', 'D.before-hide', 'D.after-hide' ]);
  });

  it('TINY-11781: Should be able to get value after component has been detached', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'get-value-after-component-detach-form');

    clickAway(editor);

    await Waiter.pTryUntil('Waited to context form to close', () => {
      store.assertEq('Should be able to get value', [ 'setup', 'teardown', '300x300' ]);
    });
  });

  it('TINY-11781: Should be able to set value after component has been detached', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'set-value-after-component-detach-form');

    clickAway(editor);

    await Waiter.pTryUntil('Waited to context form to close', () => {
      store.assertEq('Should be able to set value', [ 'setup', 'teardown', '500x500' ]);
    });
  });

  it('TINY-11432: Should trigger ContextFormSlideBack on escape key in context form', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    const collectEvent = (e: EditorEvent<void>) => store.add(e.type);

    editor.on('ContextFormSlideBack', collectEvent);

    openToolbar(editor, 'test-toolbar');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="ABC"]');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, 'input');
    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Focus should now be back on button in context toolbar', doc, '.tox-pop button');

    store.assertEq('Should have triggered ContextFormSlideBack', [ 'setup', 'contextformslideback', 'teardown' ]);

    editor.off('ContextFormSlideBack', collectEvent);
  });

  it('TINY-11432: Should trigger ContextFormSlideBack on back api call in context form', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    const collectEvent = (e: EditorEvent<void>) => store.add(e.type);

    editor.on('ContextFormSlideBack', collectEvent);

    openToolbar(editor, 'test-toolbar');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="ABC"]');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, 'input');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="F"]');
    await FocusTools.pTryOnSelector('Focus should now be back on button in context toolbar', doc, '.tox-pop button');

    store.assertEq('Should have triggered ContextFormSlideBack', [ 'setup', 'contextformslideback', 'teardown' ]);

    editor.off('ContextFormSlideBack', collectEvent);
  });

  it('TINY-11432: Should trigger ContextToolbarClose on hide api call in context form', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    const collectEvent = (e: EditorEvent<void>) => store.add(e.type);

    editor.on('ContextToolbarClose', collectEvent);

    openToolbar(editor, 'test-toolbar');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="ABC"]');
    await FocusTools.pTryOnSelector('Focus should now be on input in context form', doc, 'input');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="D"]');

    store.assertEq('Should have triggered ContextToolbarClose', [ 'setup', 'teardown', 'contexttoolbarclose', 'D.before-hide', 'D.after-hide' ]);

    editor.off('ContextToolbarClose', collectEvent);
  });

  it('TINY-11432: Should trigger ContextToolbarClose when closing ui by clicking away', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    const collectEvent = (e: EditorEvent<void>) => store.add(e.type);

    editor.on('ContextToolbarClose', collectEvent);

    openToolbar(editor, 'test-toolbar');
    await FocusTools.pTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="ABC"]');
    await FocusTools.pTryOnSelector('Focus should now be on input in context form', doc, 'input');

    clickAway(editor);

    await Waiter.pTryUntil('Waited to context toolbar to close', () => {
      store.assertEq('Should have triggered ContextToolbarClose', [ 'setup', 'teardown', 'contexttoolbarclose' ]);
    });

    editor.off('ContextToolbarClose', collectEvent);
  });

  it('TINY-11459: Input should have a placeholder when specified', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    UiFinder.exists(SugarBody.body(), '.tox-pop input[placeholder="This is a placeholder"]');
  });

  it('TINY-11559: It should be possible to disable the main input via onSetup', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    openToolbar(editor, 'test-toolbar-focus-on-init');
    TinyUiActions.clickOnUi(editor, 'button[data-mce-name="form:test-form-focus-on-init"]');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="A"]');

    FocusTools.isOnSelector('Focus should stay on the "A" button', doc, '.tox-pop__dialog button[aria-label="A"]');
    const input = await UiFinder.pWaitFor<HTMLInputElement>('getting the main input', doc, '[role="toolbar"] input');
    assert.isTrue(Attribute.has(input, 'disabled'), 'the input should be disabled');
  });

  it('TINY-11890: It should be possible to open a context toolbar with an input disabled via onSetup', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    openToolbar(editor, 'test-toolbar-disable-on-setup');
    TinyUiActions.clickOnUi(editor, 'button[data-mce-name="test-form-disable-on-setup"]');

    FocusTools.isOnSelector('Focus should stay on the "A" button', doc, '.tox-pop__dialog button[aria-label="A"]');
    const input = await UiFinder.pWaitFor<HTMLInputElement>('getting the main input', doc, '[role="toolbar"] input');
    assert.isTrue(Attribute.has(input, 'disabled'), 'the input should be disabled');
  });

  it('TINY-11665: it should not be possible to navigate to the input field if this one is disabled', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    openToolbar(editor, 'test-form');

    FocusTools.isOnSelector('Focus should be initial on the input', doc, '.tox-pop__dialog input');
    TinyUiActions.clickOnUi(editor, 'button[aria-label="E"]');
    FocusTools.isOnSelector('Focus should be moved on the "E" button after click', doc, '.tox-pop__dialog button[aria-label="E"]');
    Keyboard.activeKeydown(doc, Keys.tab());
    FocusTools.isOnSelector('Focus should stay on the "E" button', doc, '.tox-pop__dialog button[aria-label="E"]');

    TinyUiActions.clickOnUi(editor, 'button[aria-label="E"]');
    FocusTools.isOnSelector('Focus should on the the button after click', doc, '.tox-pop__dialog button[aria-label="E"]');
    Keyboard.activeKeydown(doc, Keys.tab());
    FocusTools.isOnSelector('Focus should go on the input now that it is enable', doc, '.tox-pop__dialog input');
  });
});
