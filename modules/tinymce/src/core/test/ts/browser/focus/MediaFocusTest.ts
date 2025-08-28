import { FocusTools } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.focus.MediaFocusTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-4211: Focus media will select the object', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p><audio src="custom/audio.mp3" controls="controls"></audio></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    FocusTools.setFocus(TinyDom.body(editor), 'audio');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 1);
  });

  it('TINY-4211: Focus media in a cef span will select the span', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p><span contenteditable="false"><audio src="custom/audio.mp3" controls="controls"></audio></span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    FocusTools.setFocus(TinyDom.body(editor), 'audio');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 1);
  });
});
