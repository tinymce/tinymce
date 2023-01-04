import { FocusTools, RealKeys, RealMouse } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Class, Insert, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.IframeTabfocusTest', () => {
  const asssertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should has tox-edit-focus class');
  const asssertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not has tox-edit-focus class');

  context('tab focus', () => {
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
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('TINY-9277: On tab', async () => {
      const editor = hook.editor();
      // Need to have another element to help with tabbing to change focus
      const textInput = SugarElement.fromTag('input');
      const editorElement = TinyDom.targetElement(hook.editor());
      Insert.before(editorElement, textInput);
      asssertIsNotHighlighted(editor);
      // Pressing tab to focus on the editor
      await RealKeys.pSendKeysOn('input', [ RealKeys.text('\t') ]);
      asssertIsHighlighted(editor);
      // Un focus the editor
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('\t') ]);
    });

    it('TINY-9277: Click on', async () => {
      const editor = hook.editor();
      asssertIsNotHighlighted(editor);
      await RealMouse.pClickOn('iframe => body');
      asssertIsHighlighted(editor);
    });
  });
});
