import { ApproxStructure, Assertions, FocusTools, Keys, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Obj } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ContextFormTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextForm('test-form', {
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
          }
        ]
      });

      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: Fun.never,
        items: 'form:test-form'
      });
    }
  }, [], true);

  const openToolbar = (editor: Editor, toolbarKey: string) => {
    editor.dispatch('contexttoolbar-show', {
      toolbarKey
    });
  };

  const checkLastButtonGroup = (label: string, children: ApproxStructure.Builder<StructAssert[]>) => {
    const group = UiFinder.findIn(SugarBody.body(), '.tox-pop .tox-toolbar__group:last').getOrDie();
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
    editor.nodeChanged();
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
    store.assertEq('B should have fired because it is primary', [ 'B.Words' ]);
    hasDialog('Immediate context form should have an inner dialog class');
    TinyUiActions.keyup(editor, Keys.escape());
    // Check that the context popup still exists;
    UiFinder.exists(SugarBody.body(), '.tox-pop');
    await Waiter.pTryUntil('Check that the editor still has focus', () => editor.hasFocus());
    // Simulate clicking elsewhere in the editor
    clickAway(editor);
    await pAssertNoPopDialog();
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
    // Simulate clicking elsewhere in the editor
    clickAway(editor);
    await pAssertNoPopDialog();
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
      s.element('button', { attrs: { 'aria-pressed': str.is('true') }})
    ]);
  });
});
