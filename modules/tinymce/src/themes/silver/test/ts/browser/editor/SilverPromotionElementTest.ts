import { ApproxStructure, Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverPromotionElementTest', () => {
  context('editor without menubar', () => {
    const hook = TinyHooks.bddSetupLight<Editor>(
      {
        base_url: '/project/tinymce/js/tinymce',
        menubar: false,
        promotion: true
      },
      []
    );

    it('getPromotionElement should return null when there is no menu bar', () => {
      const editor = hook.editor();
      if (editor.theme && editor.theme.getPromotionElement) {
        const promotionEl = editor.theme.getPromotionElement();

        assert.isNull(promotionEl);
      }
    });
  });

  context('editor without promotion button', () => {
    const hook = TinyHooks.bddSetupLight<Editor>(
      {
        base_url: '/project/tinymce/js/tinymce',
        menubar: 'file',
        promotion: false
      },
      []
    );

    it('getPromotionElement should return empty promotion container', () => {
      const editor = hook.editor();
      if (editor.theme && editor.theme.getPromotionElement) {
        const promotionEl = editor.theme.getPromotionElement();

        assert.isNotNull(promotionEl);
        assert.isTrue(promotionEl?.classList.contains('tox-promotion'));
        assert.isEmpty(promotionEl?.children);
      }
    });
  });

  context('editor with promotion button', () => {
    const hook = TinyHooks.bddSetupLight<Editor>(
      {
        base_url: '/project/tinymce/js/tinymce',
        menubar: 'file',
        promotion: true
      },
      []
    );

    it('getPromotionElement should return promotion container with link inside', () => {
      const editor = hook.editor();
      if (editor.theme && editor.theme.getPromotionElement) {
        const promotionEl = editor.theme.getPromotionElement();

        assert.isNotNull(promotionEl);
        Assertions.sAssertStructure(
          'promotion element should have link inside',
          ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              classes: [ arr.has('tox-promotion') ],
              children: [
                s.element('a', { classes: [ arr.has('tox-promotion-link') ] }),
              ],
            })
          ),
          SugarElement.fromDom(promotionEl)
        );
      }
    });
  });
});
