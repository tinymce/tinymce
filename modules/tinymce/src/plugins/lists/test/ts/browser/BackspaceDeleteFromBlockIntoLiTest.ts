import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('Browser Test: .RemoveTrailingBlockquoteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: backspace from p inside div into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><div><p><br /></p></div>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><br /></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from b inside p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><b><br /></b></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from span inside p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><span class="x"><br /></span></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from p into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><p><br /></p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });
});
