import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.view.ViewButtonsTest', () => {
  context('Iframe mode', () => {
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
                  name: 'buttonWithToggle',
                  type: 'togglableIconButton',
                  text: 'button-with-toggle',
                  icon: 'fullscreen',
                  onAction: (api) => {
                    buttonWithToggle = !buttonWithToggle;
                    api.setIcon(buttonWithToggle ? 'fullscreen' : 'cut');
                  }
                }
              ]
            },
            {
              name: 'buttonWithoutToggle',
              type: 'togglableIconButton',
              text: 'button-without-toggle',
              icon: 'help',
              onAction: Fun.noop
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

    const clickViewButton = (editor: Editor, tooltip: string) => TinyUiActions.clickOnUi(editor, `.tox-view button[title='${tooltip}']`);

    const getSvg = (editor: Editor, name: string) => UiFinder.findIn<HTMLElement>(TinyDom.container(editor), `.tox-view button[title='${name}'] svg`).getOrDie().dom.innerHTML;

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
  });
});
