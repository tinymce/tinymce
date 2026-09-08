import { FocusTools, RealKeys, RealMouse, Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Class, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.IframeTabfocusTest', () => {
  context('Focus shift on pressing tab', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      iframe_attrs: { // using this instead of tabindex on the target to check custom attrs don't get clobbered
        tabindex: '1'
      }
    }, [ ], true);

    before(() => {
      const editor = hook.editor();
      const container = editor.getContainer();
      const inputElem = document.createElement('input');
      inputElem.id = 'inputElem';
      inputElem.tabIndex = 2;
      container.parentNode?.insertBefore(inputElem, container);
    });

    after(() => {
      const inputElem = document.getElementById('inputElem');
      if (inputElem) {
        inputElem.parentNode?.removeChild(inputElem);
      }
    });

    it('TINY-8315: Add an input field outside the editor, focus on the editor, press the tab key and assert focus shifts to the input field', async () => {
      FocusTools.isOnSelector('iframe is focused', SugarDocument.getDocument(), 'iframe');
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('\t') ]);
      await FocusTools.pTryOnSelector('Wait for focus to be on input', SugarDocument.getDocument(), '#inputElem');
    });
  });

  context('Highlight editor content area on focus', () => {
    const assertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should have tox-edit-focus class');
    const assertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not have tox-edit-focus class');

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      highlight_on_focus: true,
      iframe_attrs: { // using this instead of tabindex on the target to check custom attrs don't get clobbered
        tabindex: '1'
      }
    }, []);

    // Shares the iframe's tabindex and precedes it in the DOM, so a tab from here always lands on the iframe
    let outsideButton: HTMLButtonElement;

    before(() => {
      const container = hook.editor().getContainer();
      outsideButton = document.createElement('button');
      outsideButton.id = 'outsideButton';
      outsideButton.tabIndex = 1;
      container.parentNode?.insertBefore(outsideButton, container);
    });

    after(() => {
      outsideButton.remove();
    });

    beforeEach(async () => {
      // Move focus out of the editor, a real tab or click in the previous test leaves focus in it. Safari ignores
      // blur() on the iframe, and its webdriver clicks into the iframe do not take focus from a focused outside
      // element, so focus the button and then blur it.
      outsideButton.focus();
      await Waiter.pTryUntil('Wait for the editor to lose its focus highlight', () => assertIsNotHighlighted(hook.editor()));
      outsideButton.blur();
    });

    it('TINY-9277: Focus on tab', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      await RealKeys.pSendKeysOn('#outsideButton', [ RealKeys.text('\t') ]);
      await Waiter.pTryUntil('Wait for the editor to be highlighted', () => assertIsHighlighted(editor));
    });

    it('TINY-9277: Focus on click', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      await RealMouse.pClickOn('iframe => body');
      await Waiter.pTryUntil('Wait for the editor to be highlighted', () => assertIsHighlighted(editor));
    });
  });
});
