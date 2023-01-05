import { context, describe, it } from '@ephox/bedrock-client';
import { Class } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.focus.HighlightOnFocus', () => {
  const assertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should have tox-edit-focus class');
  const assertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not have tox-edit-focus class');

  context('with highlight_on_focus: true', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      highlight_on_focus: true
    });

    it('TINY-9277: Content area should be highlighted on focus', () => {
      const editor = hook.editor();
      assertIsHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
    });
  });

  context('without highlight_on_focus option', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });

    it('TINY-9277: Content area should not be highlighted on focus', () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsNotHighlighted(editor);
    });
  });

});
