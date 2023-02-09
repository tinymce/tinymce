import { Keys, Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Class, Focus, Insert, Remove, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import SearchReplacePlugin from 'tinymce/plugins/searchreplace/Plugin';

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
      plugins: 'searchreplace',
      toolbar: 'searchreplace forecolor',
      highlight_on_focus: true
    }, [ SearchReplacePlugin ]);

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

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to menubar', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
      await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
      await Waiter.pWait(0);
      assertIsNotHighlighted(editor);
      TinyUiActions.keyup(editor, Keys.escape());
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to toolbar', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      await Waiter.pWait(0);
      assertIsNotHighlighted(editor);
      TinyUiActions.keyup(editor, Keys.escape());
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to inline dialog', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Find and replace"]');
      await TinyUiActions.pWaitForDialog(editor);
      await Waiter.pWait(0);
      assertIsNotHighlighted(editor);
      TinyUiActions.closeDialog(editor);
      assertIsHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to dialog', async () => {
      const editor = hook.editor();
      assertIsNotHighlighted(editor);
      editor.focus();
      assertIsHighlighted(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
      await TinyUiActions.pWaitForDialog(editor);
      await Waiter.pWait(0);
      assertIsNotHighlighted(editor);
      TinyUiActions.closeDialog(editor);
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
