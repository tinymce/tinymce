import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitDocumentWriteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    init_content_sync: true
  }, [], true);

  it('TINY-9818: Should initialize the editor', () => {
    const editor = hook.editor();
    const ifr = SelectorFind.descendant<HTMLIFrameElement>(TinyDom.container(editor), 'iframe').getOrDie('Could not find iframe');
    assert.isEmpty(ifr.dom.srcdoc, 'Should not have srcdoc');
    SelectorFind.descendant<HTMLLinkElement>(TinyDom.documentElement(editor), 'link').getOrDie('Could not find link');
  });
});

