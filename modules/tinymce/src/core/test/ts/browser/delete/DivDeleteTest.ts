import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.DivDeleteTest', () => {
  const isFirefox = PlatformDetection.detect().browser.isFirefox();

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  before(function () {
    // Firefox doesn't unwrap DIV elements if you delete inside them and it's the only child element in the BODY
    if (isFirefox) {
      this.skip();
    }
  });

  it('TINY-10840: Delete last character unwraps divs in WebKit/Blink browsers', () => {
    const editor = hook.editor();
    editor.setContent('<div><br><br>a</div>');
    TinySelections.setCursor(editor, [ 0, 2 ], 1);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<p><br><br><br></p>');
    TinyAssertions.assertCursor(editor, [ 0 ], 2);
  });
});

