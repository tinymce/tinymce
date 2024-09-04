import { TestStore, UiFinder } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Class, SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ViewButtonClasses } from 'tinymce/themes/silver/ui/toolbar/button/ButtonClasses';

describe('browser.tinymce.themes.silver.view.ViewButtonsContextTest', () => {
  const registerMode = (ed: Editor) => {
    ed.mode.register('testmode', {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: true
    });
  };

  afterEach(() => {
    hook.editor().mode.set('design');
    store.clear();
    toggleView('myview1');
  });

  const store = TestStore();

  const assertButtonNativelyDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[aria-label="${selector}"][disabled="disabled"]`);
  const assertButtonNativelyEnabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[aria-label="${selector}"]:not([disabled="disabled"])`);

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar_mode: 'floating',
    toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
    width: 500,
    setup: (editor: Editor) => {
      registerMode(editor);

      let buttonWithToggle = false;
      editor.ui.registry.addView('myview1', {
        buttons: [
          {
            type: 'group',
            buttons: [
              {
                type: 'togglebutton',
                text: 'button-with-toggle',
                tooltip: 'button-with-toggle',
                icon: 'cut',
                onAction: (api) => {
                  buttonWithToggle = !buttonWithToggle;
                  api.setIcon(buttonWithToggle ? 'fullscreen' : 'cut');
                  store.add('button-with-toggle');
                },
                context: '!readonly'
              }
            ]
          },
          {
            type: 'togglebutton',
            text: 'button-without-toggle',
            tooltip: 'button-without-toggle',
            icon: 'help',
            onAction: () => {
              store.add('button-without-toggle');
            },
            context: '!readonly'
          },
          {
            type: 'togglebutton',
            text: 'default-toggle-button',
            tooltip: 'default-toggle-button',
            icon: 'help',
            onAction: store.adder('default-toggle-button')
          },
          {
            type: 'button',
            text: 'default-button',
            tooltip: 'default-button',
            icon: 'help',
            onAction: store.adder('default-button')
          },
          {
            type: 'group',
            buttons: [
              {
                type: 'togglebutton',
                text: 'button-active-true',
                active: true,
                tooltip: 'button-active-true',
                icon: 'help',
                onAction: store.adder('button-active-true'),
                context: '!readonly'
              },
              {
                type: 'togglebutton',
                text: 'button-active-false',
                active: false,
                tooltip: 'button-active-false',
                icon: 'help',
                onAction: store.adder('button-active-false'),
                context: '!readonly'
              },
              {
                type: 'togglebutton',
                text: 'button-no-active',
                tooltip: 'button-no-active',
                icon: 'help',
                onAction: store.adder('button-no-active'),
                context: '!readonly'
              }
            ]
          },
          {
            type: 'group',
            buttons: [
              { type: 'button', text: 'Cancel', onAction: store.adder('Cancel') },
              { type: 'button', text: 'Save code', buttonType: 'primary', onAction: store.adder('Save code') }
            ]
          },
        ],
        onShow: (api: any) => {
          api.getContainer().innerHTML = '<button>myview1</button>';
          api.getContainer().querySelector('button')?.focus();
        },
        onHide: Fun.noop
      });

      editor.ui.registry.addContextToolbar('test-context', {
        predicate: (node) => node.nodeName.toLowerCase() === 'img',
        items: 'bold'
      });
    }
  }, []);

  const toggleView = (name: string) => {
    const editor = hook.editor();
    editor.execCommand('ToggleView', false, name);
  };

  const clickViewButton = (editor: Editor, tooltip: string) => TinyUiActions.clickOnUi(editor, `.tox-view button[aria-label='${tooltip}']`);

  const getSvg = (editor: Editor, name: string) => UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view button[aria-label='${name}'] svg`).getOrDie().dom.innerHTML;

  const getButtonByTitle = (title: string) => {
    const editor = hook.editor();
    return UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view button[aria-label='${title}']`).getOrDie();
  };

  it('TINY-11211: View toggle button context should reflect button state', () => {
    const editor = hook.editor();

    toggleView('myview1');
    editor.mode.set('testmode');

    assertButtonNativelyEnabled('button-with-toggle');
    const initialButtonWithToggleButtonSvg = getSvg(editor, 'button-with-toggle');
    clickViewButton(editor, 'button-with-toggle');
    assert.notEqual(getSvg(editor, 'button-with-toggle'), initialButtonWithToggleButtonSvg, 'after the first toggle icon should change');
    clickViewButton(editor, 'button-with-toggle');
    assert.equal(getSvg(editor, 'button-with-toggle'), initialButtonWithToggleButtonSvg, 'after the second toggle icon should return to the old value');
    store.sAssertEq('Clicking on button should should be permitted', [ 'button-with-toggle' ]);

    assertButtonNativelyEnabled('button-without-toggle');
    const initialbuttonWithoutToggleButtonSvg = getSvg(editor, 'button-without-toggle');
    clickViewButton(editor, 'button-without-toggle');
    assert.equal(getSvg(editor, 'button-without-toggle'), initialbuttonWithoutToggleButtonSvg, 'click should not toggle icon');
    clickViewButton(editor, 'button-without-toggle');
    assert.equal(getSvg(editor, 'button-without-toggle'), initialbuttonWithoutToggleButtonSvg, 'click should not toggle icon');
    store.sAssertEq('Clicking on button should should be permitted', [ 'button-with-toggle', 'button-without-toggle' ]);
  });

  it('TINY-9616: if is active is true the button should have ViewButtonClasses.Ticked', async () => {
    const editor = hook.editor();
    toggleView('myview1');
    await UiFinder.pWaitFor('buttons should be showed', TinyDom.container(editor), '[aria-label="button-active-true"]');

    const buttonActiveTrue = getButtonByTitle('button-active-true');
    assert.isTrue(Class.has(buttonActiveTrue, ViewButtonClasses.Ticked), 'button with active true should have ticked class');
    const buttonActiveFalse = getButtonByTitle('button-active-false');
    assert.isFalse(Class.has(buttonActiveFalse, ViewButtonClasses.Ticked), 'button with active false should not have ticked class');
    const buttonNoActive = getButtonByTitle('button-no-active');
    assert.isFalse(Class.has(buttonNoActive, ViewButtonClasses.Ticked), 'button without active flag should not have ticked class');

    clickViewButton(editor, 'button-active-true');
    clickViewButton(editor, 'button-active-false');
    clickViewButton(editor, 'button-no-active');
    store.sAssertEq('Clicking on button should should be permitted', [ 'button-active-true', 'button-active-false', 'button-no-active' ]);
  });

  it('TINY-9616: if is active is t2 rue the button should have ViewButtonClasses.Ticked', async () => {
    const editor = hook.editor();
    editor.mode.set('testmode');
    toggleView('myview1');
    await UiFinder.pWaitFor('buttons should be showed', TinyDom.container(editor), '[aria-label="Save code"]');

    clickViewButton(editor, 'Save code');
    clickViewButton(editor, 'Cancel');
    store.sAssertEq('Clicking on button should should be permitted', [ 'Save code', 'Cancel' ]);
  });

  it('TINY-9616: View button without context defaults to mode:design', async () => {
    const editor = hook.editor();
    editor.mode.set('testmode');
    toggleView('myview1');
    await UiFinder.pWaitFor('buttons should be showed', TinyDom.container(editor), '[aria-label="Save code"]');

    assertButtonNativelyDisabled('default-toggle-button');
    assertButtonNativelyDisabled('default-button');
    clickViewButton(editor, 'default-toggle-button');
    clickViewButton(editor, 'default-button');
    store.sAssertEq('Clicking on disabled button should execute onAction', []);
  });
});
