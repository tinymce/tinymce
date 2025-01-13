import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarElement } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeAriaTextTest', () => {
  const defaultIframeTitle = 'Rich Text Area';
  const defaultIframeAriaText = 'Rich Text Area';
  const defaultIframeAriaTextWithHelpPlugin = defaultIframeAriaText.concat('. Press ALT-0 for help.');
  const customIframeAriaText = 'Cupidatat magna aliquip.';
  const isFirefox = PlatformDetection.detect().browser.isFirefox();

  it('TINY-1264: Should use the default iframe aria text when iframe_aria_text is not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), defaultIframeTitle);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), defaultIframeAriaText);
    McEditor.remove(editor);
  });

  it('TINY-11672: Should add the help shortcut to default iframe aria text when help plugin is enabled', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'help',
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), isFirefox ? defaultIframeAriaTextWithHelpPlugin : defaultIframeTitle);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), defaultIframeAriaTextWithHelpPlugin);
    McEditor.remove(editor);
  });

  it('TINY-1264: Should use iframe_aria_text as the iframe aria text', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      iframe_aria_text: customIframeAriaText
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), isFirefox ? customIframeAriaText : defaultIframeTitle);
    assert.equal(Attribute.get(iframeBody, 'aria-label'), customIframeAriaText);
    McEditor.remove(editor);
  });
});
