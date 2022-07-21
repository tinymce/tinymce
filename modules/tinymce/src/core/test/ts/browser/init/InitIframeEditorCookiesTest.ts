import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeCookiesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  it('TINY-8916: Ensure cookies from the root document are accessible within the iframe', () => {
    const editor = hook.editor();
    const name = 'mce-custom-cookie-' + Math.floor(Math.random() * 1000);
    const date = new Date();
    date.setTime(date.getTime() + (60 * 1000)); // Add 1min
    document.cookie = `${name}=test; expires=${date.toUTCString()}; path=/; SameSite=Strict`;

    const doc = editor.getDoc();
    assert.include(doc.cookie, name);
  });
});
