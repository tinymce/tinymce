import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Class, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.ToxWrappingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    menubar: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('Check editor container has tox-tinymce wrapper', () => {
    const editor = hook.editor();
    const elem = TinyDom.targetElement(editor);
    const container = Traverse.nextSibling(elem).getOrDie('Replaced element has no next sibling');
    const hasToxWrapper = Class.has(container, 'tox-tinymce');
    assert.isTrue(hasToxWrapper, `Replaced element's next sibling has "tox-tinymce" class`);
  });
});
