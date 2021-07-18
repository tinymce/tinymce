import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/mcagar';
import { Attribute, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeAriaTextTest', () => {
  const defaultIframeTitle = 'Rich Text Area. Press ALT-0 for help.';
  const customIframeTitle = 'Cupidatat magna aliquip.';

  it('TINY-1264: Should use the default iframe title when iframe_aria_text is not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });
    const iframe = SugarElement.fromDom(editor.iframeElement);
    assert.equal(Attribute.get(iframe, 'title'), defaultIframeTitle);
    McEditor.remove(editor);
  });

  it('TINY-1264: Should use iframe_aria_text as the iframe title', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      iframe_aria_text: customIframeTitle
    });
    const iframe = SugarElement.fromDom(editor.iframeElement);
    assert.equal(Attribute.get(iframe, 'title'), customIframeTitle);
    McEditor.remove(editor);
  });
});
