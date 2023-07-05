import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinySelections, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ApplyToDivTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    forced_root_block: 'div',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-9872: Apply to divs', () => {
    const editor = hook.editor();
    editor.setContent('<div>Line 1</div><div>Line 2</div><div>Line 3</div>');

    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 2, 0 ], 2);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul>\n<li>Line 1</li>\n<li>Line 2</li>\n<li>Line 3</li>\n</ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 2, [ 0, 2, 0 ], 2);
  });

  it('TINY-9872: Apply to divs with selection in styling', () => {
    const editor = hook.editor();
    editor.setContent('<div><b><i>Line 1</i></b></div><div><b><i>Line 2</i></b></div><div><b><i>Line 3</i></b></div>');

    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 2, [ 2, 0, 0, 0 ], 2);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul>\n<li><strong><em>Line 1</em></strong></li>\n<li><strong><em>Line 2</em></strong></li>\n<li><strong><em>Line 3</em></strong></li>\n</ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 2, [ 0, 2, 0, 0, 0 ], 2);
  });

  it('TINY-9872: Apply to divs, but not when widely separated', () => {
    const editor = hook.editor();
    editor.setContent('<div><p>Line 1</p><p>Line 2</p></div><div><p>Line 3</p><p>Line 4</p></div>');

    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 1, 1, 0 ], 2);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<div>\n<ul>\n<li>Line 1</li>\n<li>Line 2</li>\n</ul>\n</div>\n<div>\n<p>Line 3</p>\n<p>Line 4</p>\n</div>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 2, [ 1, 1, 0 ], 2);
  });
});
