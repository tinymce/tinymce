import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.content.EditorGetContentTextFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('get text format content should trim zwsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>' + Zwsp.ZWSP + 'a</p>');
    const html = editor.getContent({ format: 'text' });
    assert.equal(html, 'a', 'Should be expected html');
  });
});
