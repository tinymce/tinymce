import { context, describe, it } from '@ephox/bedrock-client';
import { Class, Focus } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.IframeTabfocusTest', () => {
  context('Highlight editor content area on focus', () => {
    const assertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should have tox-edit-focus class');
    const assertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not have tox-edit-focus class');

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      highlight_on_focus: true,
    }, []);

    it('TINY-9277: Focus triggers highlight', async () => {
      const editor = hook.editor();

      assertIsNotHighlighted(editor);
      Focus.focus(TinyDom.body(editor));
      assertIsHighlighted(editor);
    });
  });
});
