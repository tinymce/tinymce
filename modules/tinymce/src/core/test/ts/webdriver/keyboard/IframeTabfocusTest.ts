import { FocusTools, RealKeys } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.IframeTabfocusTest', () => {
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
