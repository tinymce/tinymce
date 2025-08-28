import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeEditorWithCustomAttrsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    iframe_attrs: {
      'id': 'x',
      'data-custom1': 'a',
      'data-custom2': 'b'
    }
  }, []);

  it('Check if iframe element has the right custom attributes', () => {
    const editor = hook.editor();
    const ifr = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);

    assert.notEqual(Attribute.get(ifr, 'id'), 'x', 'Id should not be the defined x');
    assert.equal(Attribute.get(ifr, 'data-custom1'), 'a', 'Custom attribute should have the right value');
    assert.equal(Attribute.get(ifr, 'data-custom2'), 'b', 'Custom attribute should have the right value');
  });
});
