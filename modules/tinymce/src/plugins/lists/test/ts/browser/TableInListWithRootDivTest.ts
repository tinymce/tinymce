import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.TableInListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'bullist numlist indent outdent',
    text_patterns: [
      { start: '*', cmd: 'InsertUnorderedList', trigger: 'enter' },
    ],
    forced_root_block: 'div',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-10488: trigger lists via enter patterns should work also with forced_root_block: "div"', () => {
    const editor = hook.editor();
    editor.setContent('* abc');
    TinySelections.setCursor(editor, [ 0, 0 ], '* abc'.length);

    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<ul><li>abc</li><li>&nbsp;</li></ul>');
  });
});
