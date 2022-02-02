import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.fmt.FormatChangeSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('Check selection after removing part of an inline format', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>a </strong>b<strong> c</strong></em></p>');
    TinySelections.setSelection(editor, [ 0, 0, 1 ], 0, [ 0, 0, 2 ], 0);
    editor.execCommand('italic');
    TinyAssertions.assertContent(editor, '<p><em><strong>a </strong></em>b<em><strong> c</strong></em></p>');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 2 ], 0);
  });
});
