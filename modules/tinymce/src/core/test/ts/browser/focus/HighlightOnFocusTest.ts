import { Keys, Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Class, Focus, Insert, Remove, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as DialogUtils from '../../module/test/DialogUtils';

describe('browser.tinymce.core.focus.HighlightOnFocus', () => {
  const assertIsHighlighted = (editor: Editor) => assert.isTrue(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should have tox-edit-focus class');
  const assertIsNotHighlighted = (editor: Editor) => assert.isFalse(Class.has(TinyDom.container(editor), 'tox-edit-focus'), 'Editor container should not have tox-edit-focus class');
  const focusOutsideEditor = async () => {
    SelectorFind.child(SugarElement.fromDom(document.body), '#button1').map((el: any) => Focus.focus(el));
    await Waiter.pWait(200);
  };

  const pAssertIsNotHighlighted = (editor: Editor) => Waiter.pTryUntil('Waiting for focus to be shifted', () => assertIsNotHighlighted(editor));

  const assertHighlightOnFocus = (editor: Editor) => {
    assertIsNotHighlighted(editor);
    editor.focus();
    assertIsHighlighted(editor);
  };

  context('with highlight_on_focus: true', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'forecolor',
      highlight_on_focus: true
    }, []);

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
      assertHighlightOnFocus(editor);
    });

    it('TINY-9277: Content area should be not highlighted if no longer in focus', async () => {
      const editor = hook.editor();
      // focus on another element
      assertHighlightOnFocus(editor);
      await focusOutsideEditor();
      assertIsNotHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to menubar', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
      await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
      await pAssertIsNotHighlighted(editor);
      TinyUiActions.keyup(editor, Keys.escape());
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to toolbar', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      await pAssertIsNotHighlighted(editor);
      TinyUiActions.keyup(editor, Keys.escape());
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to inline toolbar dialog', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      DialogUtils.open(editor, { inline: 'toolbar' });
      await TinyUiActions.pWaitForDialog(editor);
      await pAssertIsNotHighlighted(editor);
      TinyUiActions.closeDialog(editor);
      assertIsHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to inline cursor dialog', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      DialogUtils.open(editor, { inline: 'cursor' });
      await TinyUiActions.pWaitForDialog(editor);
      await pAssertIsNotHighlighted(editor);
      TinyUiActions.closeDialog(editor);
      assertIsHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to dialog', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      DialogUtils.open(editor);
      await TinyUiActions.pWaitForDialog(editor);
      await pAssertIsNotHighlighted(editor);
      TinyUiActions.closeDialog(editor);
      assertIsHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to toolbar (with keyboard shortcuts)', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      TinyContentActions.keystroke(editor, 121, { alt: true });
      await pAssertIsNotHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to menubar (with keyboard shortcuts)', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      TinyContentActions.keystroke(editor, 120, { alt: true });
      await pAssertIsNotHighlighted(editor);
    });

    it('TINY-9277: Content area should be highlighted on focus and removed when shifted to statusbar (with keyboard shortcuts)', async () => {
      const editor = hook.editor();
      assertHighlightOnFocus(editor);
      TinyContentActions.keystroke(editor, 120, { alt: true });
      await pAssertIsNotHighlighted(editor);
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
