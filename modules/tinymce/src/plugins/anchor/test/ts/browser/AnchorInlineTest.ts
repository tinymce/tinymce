import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';

import { pAddAnchor } from '../module/Helpers';

describe('browser.tinymce.plugins.anchor.AnchorInlineTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  // Note: HTML should not be contained in the anchor because of the allow_html_in_named_anchor setting which is false by default
  it('TBA: Add anchor by selecting text content, then check that anchor is inserted correctly', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc 123</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
    TinyContentActions.keystroke(editor, Keys.space());
    await pAddAnchor(editor, 'abc', true);
    TinyAssertions.assertContent(editor, '<p>abc <a id="abc"></a>123</p>');
  });
});
