import { ApproxStructure, Assertions, FocusTools, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody, SugarDocument, Value } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ContextSliderFormTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextForm('test-form', {
        type: 'contextsliderform',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC'
        },
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        min: Fun.constant(-100),
        max: Fun.constant(100),
        initValue: Fun.constant(37),
        onSetup: (_) => {
          store.add('setup');
          return Fun.noop;
        },
        onInput: (formApi) => store.add(`input.${formApi.getValue()}(${typeof formApi.getValue()})`),
        commands: [
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'A',
            align: 'start',
            onAction: (formApi, _buttonApi) => {
              formApi.setValue(100);
            }
          },
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            align: 'end',
            tooltip: 'B',
            primary: true,
            onAction: (formApi, _buttonApi) => store.add('B.' + formApi.getValue())
          }
        ]
      });
    }
  }, [], true);

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

  const checkFirstButtonGroup = (label: string, children: ApproxStructure.Builder<StructAssert[]>) => {
    const group = UiFinder.findIn(SugarBody.body(), '.tox-pop .tox-toolbar__group:first').getOrDie();
    Assertions.assertStructure(
      label,
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: children(s, str, arr)
      })),
      group
    );
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

  const clickAway = (editor: Editor) => {
    // <a> tags make the context bar appear so click away from an a tag. We have no content so it's probably fine.
    editor.nodeChanged();
  };

  const pAssertNoPopDialog = () => Waiter.pTryUntil(
    'Pop dialog should disappear (soon)',
    () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
  );

  it('TINY-11342: Should be buttons before and after the input and the input should have focus', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    checkFirstButtonGroup('Checking buttons have right state', (s, str) => [
      s.element('button', { attrs: { 'aria-label': str.is('A') }}),
    ]);
    checkLastButtonGroup('Checking buttons have right state', (s, str) => [
      s.element('button', { attrs: { 'aria-label': str.is('B') }}),
    ]);
    await FocusTools.pTryOnSelector('Focus should now be on input in context form', SugarDocument.getDocument(), 'input');
  });

  it('TINY-11342: Input should have initial value', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop input').getOrDie();
    assert.strictEqual(Value.get(input), '37', 'Should be initial value');
  });

  it('TINY-11342: Input should trigger onInput', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop input').getOrDie();
    Value.set(input, '42');
    input.dom.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    store.assertEq('Input should trigger onInput with the right value and type', [ 'setup', 'input.42(number)' ]);
  });

  it('TINY-11494: Opening context slider form should trigger onSetup', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    await Waiter.pTryUntil(
      'Toolbar should be opened',
      () => UiFinder.exists(SugarBody.body(), '.tox-pop input')
    );
    store.assertEq('Opening contex slider form should trigger onSetup', [ 'setup' ]);
  });

  it('TINY-11342: Should have min/max attributes set', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop input').getOrDie();
    Assertions.assertEq('Should have min attribute set', '-100', Attribute.get(input, 'min'));
    Assertions.assertEq('Should have max attribute set', '100', Attribute.get(input, 'max'));
  });

  it('TINY-11342: Clicking `A` button should update the value', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    TinyUiActions.clickOnUi(editor, '.tox-pop button[aria-label="A"]');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop input').getOrDie();
    assert.strictEqual(Value.get(input), '100', 'Should be updated slider value');
  });
});

