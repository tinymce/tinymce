import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.SpapTest', () => {
  const promotionClass = 'tox-spap';

  context('spap turned off', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      promotion: false
    }, []);

    it('promotion should not be displayed', async () => {
      const editor = hook.editor();

      await Waiter.pTryUntil('Should not have spap', () => UiFinder.notExists(SugarElement.fromDom(editor.getContainer()), '.' + promotionClass));
    });
  });

  context('spap turned on', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('promotion should not be displayed', async () => {
      const editor = hook.editor();

      await Waiter.pTryUntil('Should have spap', () => UiFinder.exists(SugarElement.fromDom(editor.getContainer()), '.' + promotionClass));
    });
  });
});
