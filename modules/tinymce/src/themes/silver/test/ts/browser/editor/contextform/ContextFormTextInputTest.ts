import { Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ContextFormTextInputTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextToolbar('test-toolbar', {
        items: 'test-form',
        position: 'node',
        scope: 'node',
        predicate: (node) => node.nodeName.toLowerCase() === 'div',
      });

      ed.ui.registry.addContextForm('test-form', {
        type: 'contextform',
        launch: {
          type: 'contextformbutton',
          text: 'Alt',
          tooltip: 'Alt'
        },
        onSetup: (api) => {
          api.setInputEnabled(false);
          store.add(`input-enable-${api.isInputEnabled()}`);
          return Fun.noop;
        },
        onInput: (_api) => Fun.noop,
        label: 'Alt',
        commands: [
          {
            type: 'contextformbutton',
            align: 'start',
            icon: 'chevron-left',
            onAction: (formApi) => {
              formApi.back();
            }
          },
          {
            type: 'contextformtogglebutton',
            align: 'start',
            text: 'Decorative',
            tooltip: 'Decorative',
            onAction: (formApi, buttonApi) => {
              buttonApi.setActive(!buttonApi.isActive());
              formApi.setInputEnabled(!formApi.isInputEnabled());
            }
          },
          {
            type: 'contextformbutton',
            align: 'end',
            icon: 'info',
            tooltip: 'Check',
            onAction: (formApi) => {
              store.add(`input-enable-${formApi.isInputEnabled()}`);
            }
          },
        ]
      });
    }
  }, [], true);
  const buttonDecorativeSelector = '.tox-pop button[aria-label="Decorative"]';
  const buttonCheckSelector = '.tox-pop button[aria-label="Check"]';

  afterEach(async () => {
    const editor = hook.editor();

    store.clear();
    editor.focus();

    // Simulate clicking elsewhere in the editor
    clickAway(editor);
    await pAssertNoPopDialog();
  });

  const openToolbar = (editor: Editor, toolbarKey: string) => {
    editor.dispatch('contexttoolbar-show', {
      toolbarKey
    });
  };

  const clickAway = (editor: Editor) => {
    TinySelections.setCursor(editor, [ ], 0);
    Mouse.trueClick(TinyDom.body(editor));
  };

  const pAssertNoPopDialog = () => Waiter.pTryUntil(
    'Pop dialog should disappear (soon)',
    () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
  );

  it('TINY-11912: disabling the input `onSetup` should results in a disabled input also in the commands', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    store.assertEq('Input should be disabled by setup', [ 'input-enable-false' ]);
    TinyUiActions.clickOnUi(editor, buttonCheckSelector);
    store.assertEq('Input should be disabled by setup', [ 'input-enable-false', 'input-enable-false' ]);
  });

  it('TINY-11912: disabling the input via commands should results in a disabled input also in other commands', () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    store.assertEq('Input should be disabled by setup', [ 'input-enable-false' ]);
    TinyUiActions.clickOnUi(editor, buttonDecorativeSelector);
    TinyUiActions.clickOnUi(editor, buttonCheckSelector);
    store.assertEq('Input should be disabled by setup', [ 'input-enable-false', 'input-enable-true' ]);
    TinyUiActions.clickOnUi(editor, buttonDecorativeSelector);
    TinyUiActions.clickOnUi(editor, buttonCheckSelector);
    store.assertEq('Input should be disabled by setup', [ 'input-enable-false', 'input-enable-true', 'input-enable-false' ]);
  });
});

