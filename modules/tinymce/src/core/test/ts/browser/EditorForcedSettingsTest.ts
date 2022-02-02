import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorForcedSettingsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    // Setting exposed as another forced setting
    inline: true,
    // Settings that are to be forced
    validate: false
  }, [ Theme ]);

  it('Validate forced settings', () => {
    const editor = hook.editor();
    assert.isTrue(editor.settings.validate, 'Validate should always be true');
    assert.isTrue(editor.inline, 'Validate should true since inline was set to true');
  });
});
