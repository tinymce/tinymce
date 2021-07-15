import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.EventsTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
    menubar: 'file'
  };

  const hook1 = TinyHooks.bddSetupLight(settings, [ Theme ]);
  const hook2 = TinyHooks.bddSetupLight(settings, [ Theme ]);
  const menuSelector = '[role="menu"]';

  const pWaitMenuToOpen = () =>
    Waiter.pTryUntil('Wait for a menu to open', () => UiFinder.exists(SugarBody.body(), menuSelector));

  const pWaitMenuToClose = () =>
    Waiter.pTryUntil('Wait for all menus to close', () => UiFinder.notExists(SugarBody.body(), menuSelector));

  it('TINY-7399: Clicking on the editor should close the menu', async () => {
    const editor = hook1.editor();
    TinyUiActions.clickOnMenu(editor, '[role="menuitem"]');
    await pWaitMenuToOpen();
    TinyContentActions.trueClick(editor);
    await pWaitMenuToClose();
  });

  it('TINY-7399: Clicking on the editor should close the context menu', async () => {
    const editor = hook1.editor();
    TinyContentActions.trueClick(editor);
    await TinyUiActions.pTriggerContextMenu(editor, 'p', '[role="menu"]');
    TinyContentActions.trueClick(editor);
    await pWaitMenuToClose();
  });

  it('TINY-7399: Clicking on the editor should close other editors menus', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    TinyUiActions.clickOnMenu(editor1, '[role="menuitem"]');
    await pWaitMenuToOpen();
    TinyContentActions.trueClick(editor2);
    await pWaitMenuToClose();
  });

  it('TINY-7399: Clicking on the editor should close other editors context menus', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    await TinyUiActions.pTriggerContextMenu(editor1, 'p', '[role="menu"]');
    TinyContentActions.trueClick(editor2);
    await pWaitMenuToClose();
  });

  it('TINY-7399: Opening a menu in the editor should close other editor\'s menu', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    TinyUiActions.clickOnMenu(editor1, '[role="menuitem"]');
    await pWaitMenuToOpen();
    Mouse.trueClickOn(TinyDom.container(editor2), '[role="menuitem"]');
    await pWaitMenuToClose();

    const menus = UiFinder.findAllIn(SugarBody.body(), '[role="menu"]');
    assert.lengthOf(menus, 1, 'Should have one menu open');
  });
});
