import { ApproxStructure } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.util.QuirksFirefoxTest', () => {
  before(function () {
    if (!Env.browser.isFirefox()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    disable_nodechange: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  context('addBrAfterLastLinks', () => {
    it('TINY-9172: Should add bogus br after link', () => {
      const editor = hook.editor();
      editor.setContent('<div><a href="#">test</a></div>');
      TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
        return s.element('body', {
          children: [
            s.element('div', {
              children: [
                s.element('a', { attrs: { href: str.is('#') }, children: [ s.text(str.is('test')) ] }),
                s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }})
              ]
            })
          ]
        });
      }));
    });

    it('TINY-9172: Should add not add bogus br after block link', () => {
      const editor = hook.editor();
      editor.setContent('<div><a href="#"><p>test</p></a></div>');
      TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
        return s.element('body', {
          children: [
            s.element('div', {
              children: [
                s.element('a', {
                  attrs: { 'href': str.is('#'), 'data-mce-block': str.is('true') },
                  children: [
                    s.element('p', { children: [ s.text(str.is('test')) ] })
                  ]
                })
              ]
            })
          ]
        });
      }));
    });
  });
});
