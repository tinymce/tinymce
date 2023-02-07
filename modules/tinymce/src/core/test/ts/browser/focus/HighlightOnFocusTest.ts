import { Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Class, Focus, Insert, Remove, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.focus.HighlightOnFocus', () => {
  const assertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should have tox-edit-focus class');
  const assertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not have tox-edit-focus class');
  const focusOutsideEditor = async () => {
    SelectorFind.child(SugarElement.fromDom(document.body), '#button1').map((el: any) => Focus.focus(el));
    await Waiter.pWait(200);
  };

  context('with highlight_on_focus: true', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      highlight_on_focus: true
    });

    before(() => {
      const fakeButton = SugarElement.fromTag('button');
      const body = SugarElement.fromDom(document.body);
      Attribute.set(fakeButton, 'id', 'button1');
      Insert.append(fakeButton, SugarElement.fromText('Button 1'));
      Insert.append(body, fakeButton);
    });

    after(() => {
      // clean up
      SelectorFind.child(SugarElement.fromDom(document.body), '#button1').map(Remove.remove);
    });

    beforeEach(async () => {
      await focusOutsideEditor();
    });

    it('TINY-9277: Content area should be highlighted on focus', () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
    });

    it('TINY-9277: Content area should be not highlighted if no longer in focus', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);

      // focus on another element
      await focusOutsideEditor();
      assertIsNotHighlighted(editor);
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
