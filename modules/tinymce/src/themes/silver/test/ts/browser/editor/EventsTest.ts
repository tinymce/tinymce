import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.EventsTest', () => {
  const hook1 = TinyHooks.bddSetup({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
  }, [ Theme ]);

  const hook2 = TinyHooks.bddSetup({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
  }, [ Theme ]);

  const waitToOpen = (selector: string) => {
    return Waiter.pTryUntil(`Wait ${selector} to open`, () => UiFinder.exists(SugarBody.body(), selector));
  };

  const waitToClose = (selector: string) => {
    return Waiter.pTryUntil(`Wait ${selector} to close`, () => UiFinder.notExists(SugarBody.body(), selector));
  };

  it('TINY-7399: Clicking on the editor should close the menu', async () => {
    const editor = hook1.editor();
    TinyUiActions.clickOnMenu(editor, '[role="menuitem"]');
    await waitToOpen('[role="menu"]');
    TinyContentActions.trueClick(editor);
    await waitToClose('[role="menu"]');
  });

  it('TINY-7399: Clicking on the editor should close the context menu', async () => {
    const editor = hook1.editor();
    TinyContentActions.trueClick(editor);
    await TinyUiActions.pTriggerContextMenu(editor, 'p', '[role="menu"]');
    TinyContentActions.trueClick(editor);
    await waitToClose('[role="menu"]');
  });

  it('TINY-7399: Clicking on the editor should close other editor menu', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    TinyUiActions.clickOnMenu(editor1, '[role="menuitem"]');
    await waitToOpen('[role="menu"]');
    TinyContentActions.trueClick(editor2);
    await waitToClose('[role="menu"]');
  });

  it('TINY-7399: Clicking on the editor should close other editor context menu', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    await TinyUiActions.pTriggerContextMenu(editor1, 'p', '[role="menu"]');
    TinyContentActions.trueClick(editor2);
    await waitToClose('[role="menu"]');
  });

  it('TINY-7399: Opening a menu in the editor should close other editor\'s menu', async () => {
    const editor1 = hook1.editor();
    const editor2 = hook2.editor();

    TinyUiActions.clickOnMenu(editor1, '[role="menuitem"]');
    await waitToOpen('[role="menu"]');
    Mouse.trueClickOn(SugarElement.fromDom(editor2.getContainer()), '[role="menuitem"]');
    await waitToOpen('[role="menu"]');

    const menus = UiFinder.findAllIn(SugarBody.body(), '[role="menu"]');
    assert.equal(menus.length, 1, 'Should have one menu open');
  });
});
