import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.PromotionTest', () => {
  const promotionClass = 'tox-promotion';

  context('TINY-8840: promotion turned off', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('promotion should not be displayed', () => {
      const editor = hook.editor();

      UiFinder.notExists(SugarElement.fromDom(editor.getContainer()), '.' + promotionClass);
    });
  });

  context('TINY-8840: promotion turned on', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      promotion: true
    }, []);

    it('promotion should not be displayed', () => {
      const editor = hook.editor();

      UiFinder.exists(SugarElement.fromDom(editor.getContainer()), '.' + promotionClass);
    });
  });
});
