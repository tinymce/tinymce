import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Attribute, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.init.InitIframeContentAriaLabelTest', () => {
  const defaultIframeTitle = 'Rich Text Area. Press ALT-0 for help.';
  const customIframeTitle = 'Cupidatat magna aliquip.';
  const hookWithDefaultIframeTitle = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ]);
  const hookWithContentAriaLabel = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    content_aria_label: customIframeTitle
  }, [ Theme ]);

  it('TINY-1264: Should use the default iframe title when content_aria_label is not set', () => {
    const editor = hookWithDefaultIframeTitle.editor();
    const iframe = SugarElement.fromDom(editor.iframeElement);

    assert.equal(Attribute.get(iframe, 'title'), defaultIframeTitle);
  });

  it('TINY-1264: Should use content_aria_label as iframe title', () => {
    const editor = hookWithContentAriaLabel.editor();
    const iframe = SugarElement.fromDom(editor.iframeElement);

    assert.equal(Attribute.get(iframe, 'title'), customIframeTitle);
  });
});
