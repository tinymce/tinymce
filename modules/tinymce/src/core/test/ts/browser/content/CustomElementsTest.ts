import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.CustomElementsTest', () => {
  context('Custom elements using spec', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      custom_elements: {
        foo: {
          extends: 'div'
        },
        bar: {
          extends: 'span'
        }
      },
    }, []);

    it('TINY-9880: Custom elements that is treated as span/div', () => {
      const editor = hook.editor();
      editor.setContent('<foo>hello<em>world</em><bar>!!</bar>');
      TinyAssertions.assertContent(editor, '<foo>hello<em>world</em><bar>!!</bar></foo>');
    });
  });

  context('Custom elements using names', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      custom_elements: 'foo,~bar'
    }, []);

    it('TINY-9880: Custom elements that is treated as span/div', () => {
      const editor = hook.editor();
      editor.setContent('<foo>hello<em>world</em><bar>!!</bar>');
      TinyAssertions.assertContent(editor, '<foo>hello<em>world</em><bar>!!</bar></foo>');
    });
  });
});
