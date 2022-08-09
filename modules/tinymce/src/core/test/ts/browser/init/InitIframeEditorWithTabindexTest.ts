import { describe, it } from '@ephox/bedrock-client';
import { Attribute, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitIframeEditorWithTabindexTest', () => {
  const setup = () => {
    const elem = SugarElement.fromTag('textarea');
    Attribute.set(elem, 'tabindex', '7');
    Insert.append(SugarBody.body(), elem);

    return {
      element: elem,
      teardown: () => Remove.remove(elem)
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, setup, []);

  it('TINY-8315: Check if the iframe element has the right tabindex attribute', () => {
    const editor = hook.editor();
    const ifr = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    assert.equal(Attribute.get(ifr, 'tabindex'), '7', 'Tabindex attribute should have the right value');
  });
});
