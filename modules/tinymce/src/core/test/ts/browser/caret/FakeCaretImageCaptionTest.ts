import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.core.FakeCaretImageCaptionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'image',
    image_caption: true
  }, [ ImagePlugin ]);

  it('TINY-11997: should hide after tabbing inside figcaption', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<figure class="image">' +
        '<img src="img.png" width="354" height="116">' +
        '<figcaption>Caption</figcaption>' +
      '</figure>'
    );

    TinySelections.setCursor(editor, [], 0);
    TinyAssertions.assertContentPresence(editor, { '.mce-visual-caret': 1 });
    // it's used `setRawSelection` instead of `setCursor` because `setCursor` remove the fake caret even with the old code
    TinySelections.setRawSelection(editor, [ 1, 1 ], 0, [ 1, 1 ], 0);
    TinyAssertions.assertContentPresence(editor, { '.mce-visual-caret': 0 });
  });
});
