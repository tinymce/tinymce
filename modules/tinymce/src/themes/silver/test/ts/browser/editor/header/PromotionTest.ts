import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.PromotionTest', () => {
  const promotionClass = 'tox-promotion';

  context('promotion turned off', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('TINY-8840: promotion should not be displayed', () => {
      const editor = hook.editor();

      UiFinder.notExists(SugarElement.fromDom(editor.getContainer()), '.' + promotionClass);
    });
  });

  context('promotion turned on', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      promotion: true
    }, []);

    it('TINY-8840: promotion should not be displayed', () => {
      const editor = hook.editor();

      const editorContainer = SugarElement.fromDom(editor.getContainer());
      UiFinder.exists(editorContainer, '.' + promotionClass);
      Assertions.assertStructure(
        'Editor structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-tinymce') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-editor-container') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-editor-header') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-promotion') ],
                      children: [
                        s.element('a', {
                          classes: [ arr.has('tox-promotion-link') ],
                          attrs: {
                            rel: str.is('noopener'),
                            target: str.is('_blank'),
                            href: str.startsWith('http')
                          }
                        }),
                      ]
                    }),
                    s.element('div', {}),
                    s.element('div', {}),
                    s.element('div', {}),
                  ]
                }),
                s.element('div', {}),
              ]
            }),
            s.element('div', {}),
            s.element('div', {}),
          ]
        })),
        editorContainer);
    });
  });
});
