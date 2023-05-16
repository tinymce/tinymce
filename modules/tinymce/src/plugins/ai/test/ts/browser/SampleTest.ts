import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/ai/Plugin';

describe('browser.tinymce.plugins.ai.SampleTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'ai',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('Sample test', () => {
    const editor = hook.editor();
    assert.isDefined(editor);
  });
});
