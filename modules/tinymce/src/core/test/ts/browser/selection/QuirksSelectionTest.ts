import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Unicode } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.selection.QuirksSelectionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, []);
  const platform = PlatformDetection.detect();

  Arr.each([ true, false ], (before) => {
    it('TINY-11676: pressing enter after clicking on a `p` containg a floating `img` in FireFox should not duplicate the image ' + (before ? '(before)' : '(after)'), async function () {
      // this test is needed only for Firefox
      if (!platform.browser.isFirefox()) {
        this.skip();
      }

      const editor = hook.editor();
      const initialContent = '<p><strong><img style="display: block; margin-left: auto; margin-right: auto;" src="img.jpg" width="1" height="1"></strong></p>';
      editor.setContent(initialContent);
      const imgElement = await UiFinder.pWaitFor<HTMLElement>('', TinyDom.body(editor), 'img');
      const pRect = imgElement.dom.getBoundingClientRect();
      const clientX = before ? pRect.left - 2 : pRect.left + 2;
      const clientY = pRect.top;
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY
      });
      TinyDom.body(editor).dom.dispatchEvent(mouseDownEvent);
      await Waiter.pTryUntil('selection now should be on the `strong`', () => TinyAssertions.assertCursor(editor, [ 0, 0 ], before ? 0 : 1));
      editor.execCommand('mceInsertNewLine');
      TinyAssertions.assertContent(editor, before ? `<p>${Unicode.nbsp}</p>${initialContent}` : `${initialContent}<p>${Unicode.nbsp}</p>`);
    });
  });
});
