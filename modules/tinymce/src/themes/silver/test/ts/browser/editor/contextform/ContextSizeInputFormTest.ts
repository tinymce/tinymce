import { ApproxStructure, Assertions, FocusTools, StructAssert, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument, Value } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ContextSizeInputFormTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addContextToolbar('test-toolbar', {
        items: 'test-form',
        position: 'node',
        scope: 'node',
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
      });

      ed.ui.registry.addContextForm('test-form', {
        type: 'contextsizeinputform',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC'
        },
        initValue: Fun.constant({ width: '100', height: '200' }),
        onSetup: (_) => {
          store.add('setup');
          return Fun.noop;
        },
        onInput: (formApi) => store.add(`input.${JSON.stringify(formApi.getValue())}`),
        commands: [
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'A',
            align: 'start',
            onAction: (formApi, _buttonApi) => {
              formApi.setValue({ width: '200', height: '400' });
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

      ed.ui.registry.addContextToolbar('test-toolbar-with-back', {
        items: 'test-form-with-back undo',
        position: 'node',
        scope: 'node',
        predicate: (node) => node.nodeName.toLowerCase() === 'div',
      });

      ed.ui.registry.addContextForm('test-form-with-back', {
        type: 'contextsizeinputform',
        launch: {
          type: 'contextformtogglebutton',
          icon: 'fake-icon-name',
          tooltip: 'ABC'
        },
        initValue: Fun.constant({ width: '100', height: '200' }),
        onInput: (formApi) => store.add(`input.${JSON.stringify(formApi.getValue())}`),
        commands: [
          {
            type: 'contextformbutton',
            icon: 'fake-icon-name',
            tooltip: 'Back',
            align: 'start',
            onAction: (formApi) => formApi.back()
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
    const inputW = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop .tox-context-form__group:nth-child(1) input').getOrDie();
    const inputH = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop .tox-context-form__group:nth-child(2) input').getOrDie();
    assert.strictEqual(Value.get(inputW), '100', 'Should be initial width value');
    assert.strictEqual(Value.get(inputH), '200', 'Should be initial height value');
  });

  it('TINY-11342: Input should trigger onInput and constrain the proportions', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    const inputW = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop .tox-context-form__group:nth-child(1) input').getOrDie();
    Value.set(inputW, '200');
    inputW.dom.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    inputW.dom.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    store.assertEq('Input should trigger onInput', [ 'setup', 'input.{"width":"200","height":"400"}' ]);
  });

  it('TINY-11494: Opening context size input form should trigger onSetup', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    await Waiter.pTryUntil(
      'Toolbar should be opened',
      () => UiFinder.exists(SugarBody.body(), '.tox-pop .tox-context-form__group')
    );
    store.assertEq('Opening contex size input form should trigger onSetup', [ 'setup' ]);
  });

  it('TINY-11342: Clicking `A` button should update the values', async () => {
    const editor = hook.editor();
    openToolbar(editor, 'test-form');
    TinyUiActions.clickOnUi(editor, '.tox-pop button[aria-label="A"]');
    const inputW = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop .tox-context-form__group:nth-child(1) input').getOrDie();
    const inputH = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), '.tox-pop .tox-context-form__group:nth-child(2) input').getOrDie();
    assert.strictEqual(Value.get(inputW), '200', 'Should be updated width value');
    assert.strictEqual(Value.get(inputH), '400', 'Should be updated height value');
  });

  it('TINY-11342: When the context form is opened on the right side and does not fit the popup should be repositioned', async () => {
    const editor = hook.editor();
    editor.setContent('<p style="float: right"><a href="#" style="padding-right: 100px">link</a></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    await UiFinder.pWaitFor('Waiting for context toolbar to appear', SugarBody.body(), '.tox-pop[data-alloy-placement="south"]');
    TinyUiActions.clickOnUi(editor, '.tox-pop button[aria-label="ABC"]');
    await UiFinder.pWaitFor('Waiting for context toolbar to appear', SugarBody.body(), '.tox-pop[data-alloy-placement="southwest"] input');
  });

  it('TINY-11344: pressing `back` should show the previous toolbar', async () => {
    const editor = hook.editor();
    editor.setContent('<div>some div</div>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    await UiFinder.pWaitFor('Waiting for context toolbar to appear', SugarBody.body(), '.tox-pop[data-alloy-placement="south"]');
    TinyUiActions.clickOnUi(editor, '.tox-pop button[aria-label="ABC"]');
    TinyUiActions.clickOnUi(editor, '.tox-pop button[aria-label="Back"]');
    await UiFinder.pWaitFor('Waiting for context toolbar to previous toolbar to appear', SugarBody.body(), '.tox-pop button[aria-label="Undo"]');
  });
});

