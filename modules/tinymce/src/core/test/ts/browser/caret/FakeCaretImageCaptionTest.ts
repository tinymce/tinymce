import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.core.FakeCaretImageCaptionTest', () => {
  const browser = PlatformDetection.detect().browser;
  const isFirefox = browser.isFirefox();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'image',
    image_caption: true
  }, [ ImagePlugin ]);

  // skiped on FireFox since `setRawSelection` seems not to work on it
  (isFirefox ? it.skip : it)('TINY-11997: should hide after tabbing inside figcaption', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<figure class="image">' +
        '<img src="img.png" width="354" height="116">' +
        '<figcaption>Caption</figcaption>' +
      '</figure>'
    );

    TinySelections.setCursor(editor, [], 0);
    await Waiter.pTryUntil('Wait for fake caret to be added', () => {
      TinyAssertions.assertContentPresence(editor, { '.mce-visual-caret': 1 });
    });
    TinySelections.setRawSelection(editor, [ 1, 1, 0 ], 0, [ 1, 1, 0 ], 0);
    await Waiter.pTryUntil('Wait for fake caret to be removed', () => {
      TinyAssertions.assertContentPresence(editor, { '.mce-visual-caret': 0 });
    });
  });
});
