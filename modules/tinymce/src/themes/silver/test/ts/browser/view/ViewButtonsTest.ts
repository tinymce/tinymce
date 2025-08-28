import { FocusTools, UiFinder } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Class, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ViewButtonClasses } from 'tinymce/themes/silver/ui/toolbar/button/ButtonClasses';

describe('browser.tinymce.themes.silver.view.ViewButtonsTest', () => {
  context('Iframe mode', () => {

    afterEach(() => toggleView('myview1'));

    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      setup: (editor: Editor) => {
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
                  }
                }
              ]
            },
            {
              type: 'togglebutton',
              text: 'button-without-toggle',
              tooltip: 'button-without-toggle',
              icon: 'help',
              onAction: Fun.noop
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
                  onAction: Fun.noop
                },
                {
                  type: 'togglebutton',
                  text: 'button-active-false',
                  active: false,
                  tooltip: 'button-active-false',
                  icon: 'help',
                  onAction: Fun.noop
                },
                {
                  type: 'togglebutton',
                  text: 'button-no-active',
                  tooltip: 'button-no-active',
                  icon: 'help',
                  onAction: Fun.noop
                }
              ]
            },
            {
              type: 'togglebutton',
              text: 'button-focus-api',
              tooltip: 'button-focus-api',
              icon: 'help',
              onAction: (api) => {
                // focusing something else and then running api.focus to refocus the button (whitout it we would focus an already focused button)
                FocusTools.setFocus(TinyDom.container(editor), '.tox-view');
                FocusTools.isOnSelector('Focus should be on clicked button', SugarDocument.getDocument(), `.tox-view`);
                api.focus();
              }
            }
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

    it('TINY-9523: tooglable button can be toggled with the correct implementation', () => {
      const editor = hook.editor();

      toggleView('myview1');

      const initialButtonWithToggleButtonSvg = getSvg(editor, 'button-with-toggle');
      clickViewButton(editor, 'button-with-toggle');
      assert.notEqual(getSvg(editor, 'button-with-toggle'), initialButtonWithToggleButtonSvg, 'after the first toggle icon should change');
      clickViewButton(editor, 'button-with-toggle');
      assert.equal(getSvg(editor, 'button-with-toggle'), initialButtonWithToggleButtonSvg, 'after the second toggle icon should return to the old value');

      const initialbuttonWithoutToggleButtonSvg = getSvg(editor, 'button-without-toggle');
      clickViewButton(editor, 'button-without-toggle');
      assert.equal(getSvg(editor, 'button-without-toggle'), initialbuttonWithoutToggleButtonSvg, 'click should not toggle icon');
      clickViewButton(editor, 'button-without-toggle');
      assert.equal(getSvg(editor, 'button-without-toggle'), initialbuttonWithoutToggleButtonSvg, 'click should not toggle icon');
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
    });

    it('TINY-11122: view button should be focused after using focus api function', async () => {
      const editor = hook.editor();
      toggleView('myview1');
      await UiFinder.pWaitFor('buttons should be showed', TinyDom.container(editor), '[aria-label="button-active-true"]');

      clickViewButton(editor, 'button-focus-api');
      FocusTools.isOnSelector('Focus should be on clicked button', SugarDocument.getDocument(), `button[aria-label='button-focus-api']`);
    });
  });
});
