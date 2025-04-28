import { UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
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

  before(function () {
    // these test is needed only for Firefox
    if (!platform.browser.isFirefox()) {
      this.skip();
    }
  });

  const floatingCenterStyle = 'display: block; margin-left: auto; margin-right: auto;';
  const floatLeftStyle = 'float: left;';
  const floatRightStyle = 'float: right;';
  const testSelection = async (position: 'before' | 'on' | 'after', style: string) => {
    const editor = hook.editor();
    const initialContent = `<p><strong><img style="${style}" src="img.jpg" width="10" height="10"></strong></p>`;
    editor.setContent(initialContent);
    const imgElement = await UiFinder.pWaitFor<HTMLElement>('', TinyDom.body(editor), 'img');
    const pRect = imgElement.dom.getBoundingClientRect();
    const clientX = pRect.left + {
      before: -2,
      on: 2,
      after: 12
    }[position];

    const clientY = pRect.top;
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY
    });
    TinyDom.body(editor).dom.dispatchEvent(mouseDownEvent);
    switch (position) {
      case 'before':
        await Waiter.pTryUntil('selection now should be on the `strong`', () => TinyAssertions.assertCursor(editor, [ 0, 0 ], 0));
        break;
      case 'on':
        await Waiter.pTryUntil('selection now should be on the `img`', () => TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1));
        break;
      case 'after':
        await Waiter.pTryUntil('selection now should be on the `strong`', () => TinyAssertions.assertCursor(editor, [ 0, 0 ], 1));
        break;
    }

    editor.execCommand('mceInsertNewLine');
    switch (position) {
      case 'before':
        TinyAssertions.assertContent(editor, `<p>${Unicode.nbsp}</p>${initialContent}`);
        break;
      case 'after':
        TinyAssertions.assertContent(editor, `${initialContent}<p>${Unicode.nbsp}</p>`);
        break;
      case 'on':
        TinyAssertions.assertContent(editor, `<p>${Unicode.nbsp}</p><p>${Unicode.nbsp}</p>`);
        break;
    }
  };

  it('TINY-11676: clicking on a `p` containg a center floating `img` in FireFox before the image', async () => {
    await testSelection('before', floatingCenterStyle);
  });

  it('TINY-11676: clicking on a `p` containg a center floating `img` in FireFox after the image', async () => {
    await testSelection('after', floatingCenterStyle);
  });

  it('TINY-11676: clicking on a `p` containg a left floating `img` in FireFox on the image', async () => {
    await testSelection('on', floatLeftStyle);
  });

  it('TINY-11676: clicking on a `p` containg a right floating `img` in FireFox on the image', async () => {
    await testSelection('on', floatRightStyle);
  });
});
