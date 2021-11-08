import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorContentForcedRootBlockTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    forced_root_block: 'div'
  }, []);

  it('getContent empty editor depending on forced_root_block setting', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p>', { format: 'raw' });
    TinyAssertions.assertContent(editor, '<p>&nbsp;</p>');
    editor.setContent('<div><br></div>', { format: 'raw' });
    TinyAssertions.assertContent(editor, '');
  });
});
