import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Attribute, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.init.InitIframeEditorWithCustomAttrsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    iframe_attrs: {
      'id': 'x',
      'data-custom1': 'a',
      'data-custom2': 'b'
    }
  }, [ Theme ]);

  it('Check if iframe element has the right custom attributes', () => {
    const editor = hook.editor();
    const ifr = SugarElement.fromDom(editor.iframeElement);

    assert.notEqual(Attribute.get(ifr, 'id'), 'x', 'Id should not be the defined x');
    assert.equal(Attribute.get(ifr, 'data-custom1'), 'a', 'Custom attribute should have the right value');
    assert.equal(Attribute.get(ifr, 'data-custom2'), 'b', 'Custom attribute should have the right value');
  });
});
