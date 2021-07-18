import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyContentActions, TinyDom, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.EventsTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
    menubar: 'file'
  };

  const menuSelector = '[role="menu"]';
  const menuItemSelector = '[role="menuitem"]';

  const pWaitMenuToOpen = () =>
    Waiter.pTryUntil('Wait for a menu to open', () => UiFinder.exists(SugarBody.body(), menuSelector));

  const pWaitMenuToClose = () =>
    Waiter.pTryUntil('Wait for all menus to close', () => UiFinder.notExists(SugarBody.body(), menuSelector));

  it('TINY-7399: Clicking on the editor should close the menu', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    TinyUiActions.clickOnMenu(editor, menuItemSelector);
    await pWaitMenuToOpen();
    TinyContentActions.trueClick(editor);
    await pWaitMenuToClose();
    McEditor.remove(editor);
  });

  it('TINY-7399: Clicking on the editor should close the context menu', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    TinyContentActions.trueClick(editor);
    await TinyUiActions.pTriggerContextMenu(editor, 'p', menuSelector);
    TinyContentActions.trueClick(editor);
    await pWaitMenuToClose();
    McEditor.remove(editor);
  });

  it('TINY-7399: Clicking on the editor should close other editors menus', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    TinyUiActions.clickOnMenu(editor1, menuItemSelector);
    await pWaitMenuToOpen();
    TinyContentActions.trueClick(editor2);
    await pWaitMenuToClose();
    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });

  it('TINY-7399: Clicking on the editor should close other editors context menus', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    await TinyUiActions.pTriggerContextMenu(editor1, 'p', menuSelector);
    TinyContentActions.trueClick(editor2);
    await pWaitMenuToClose();
    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });

  it('TINY-7399: Opening a menu in the editor should close other editor\'s menu', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    TinyUiActions.clickOnMenu(editor1, menuItemSelector);
    await pWaitMenuToOpen();
    Mouse.trueClickOn(TinyDom.container(editor2), menuItemSelector);
    await pWaitMenuToClose();

    const menus = UiFinder.findAllIn(SugarBody.body(), menuSelector);
    assert.lengthOf(menus, 1, 'Should have one menu open');
    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });
});
