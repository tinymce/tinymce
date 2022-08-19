import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SelectorFind } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.header.PromotionTest', () => {
  const promotionSelector = '.tox-promotion';

  context('promotion turned off', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      promotion: false
    }, []);

    it('TINY-8840: promotion should not be displayed', () => {
      const editor = hook.editor();

      UiFinder.notExists(TinyDom.container(editor), promotionSelector);
    });
  });

  context('promotion turned on', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      promotion: true
    }, []);

    it('TINY-8840: promotion should be displayed', () => {
      const editor = hook.editor();

      const editorContainer = TinyDom.container(editor);
      const header = SelectorFind.descendant(editorContainer, '.tox-editor-header').getOrDie();
      UiFinder.exists(header, promotionSelector);
      Assertions.assertStructure(
        'Editor header structure',
        ApproxStructure.build((s, str, arr) =>
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
              s.element('div', {
                classes: [ arr.has('tox-menubar') ]
              }),
              s.theRest(),
            ]
          })
        ),
        header);
    });
  });
});
