import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarElement } from '@ephox/sugar';
import { McEditor, TinyAssertions, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeAriaTextTest', () => {
  const defaultIframeAriaText = 'Rich Text Area';
  const defaultIframeAriaTextWithHelpPlugin = defaultIframeAriaText.concat('. Press ALT-0 for help.');
  const customIframeAriaText = 'Cupidatat magna aliquip.';
  const isMac = PlatformDetection.detect().os.isMacOS();
  const isIos = PlatformDetection.detect().os.isiOS();

  it('TINY-1264: Should use the default iframe aria text when iframe_aria_text is not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), defaultIframeAriaText);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), isMac ? defaultIframeAriaText : undefined);
    McEditor.remove(editor);
  });

  it('TINY-11672: Should add the help shortcut to default iframe aria text when help plugin is enabled', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'help',
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), defaultIframeAriaTextWithHelpPlugin);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), isMac ? defaultIframeAriaTextWithHelpPlugin : undefined);
    McEditor.remove(editor);
  });

  it('TINY-1264: Should use iframe_aria_text as the iframe aria text', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      iframe_aria_text: customIframeAriaText
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), customIframeAriaText);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), isMac ? customIframeAriaText : undefined);
    McEditor.remove(editor);
  });

  it('TINYMCE-13100: Should expose the body as a multiline textbox only on MacOS and IOS', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('body', {
      attrs: {
        'role': isMac || isIos ? str.is('textbox') : str.none(),
        'aria-multiline': isMac || isIos ? str.is('true') : str.none(),
        'aria-label': isMac || isIos ? str.is(defaultIframeAriaText) : str.none()
      }
    })));
    McEditor.remove(editor);
  });
});
