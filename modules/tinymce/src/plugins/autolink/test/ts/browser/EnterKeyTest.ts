import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autolink/Plugin';

describe('browser.tinymce.plugins.autolink.EnterKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-1202: Focus on editor, set content, set cursor at end of content, assert enter/return keystroke and keydown event', () => {
    const editor = hook.editor();
    editor.setContent('<p>abcdefghijk</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abcdefghijk'.length);
    TinyContentActions.keydown(editor, Keys.enter());
    assert.doesNotThrow(() => {
      editor.dispatch('keydown', { keyCode: Keys.enter() } as KeyboardEvent);
    }, 'should not throw error');
  });
});
