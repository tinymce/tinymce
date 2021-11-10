import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.themes.silver.editor.EventsTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'link',
    menubar: 'file edit'
  };

  const contextMenuItemSelector = '[role="menuitem"]:contains("Link...")';
  const fileMenuSelector = '[role="menuitem"]:contains("New document")';
  const editMenuSelector = '[role="menuitem"]:contains("Cut")';
  const fileMenuButtonSelector = 'button:contains("File")';
  const editMenuButtonSelector = 'button:contains("Edit")';

  before(() => {
    LinkPlugin();
  });

  const pAssertMenuOpen = (selector: string) =>
    Waiter.pTryUntil('Wait for a specific menu to open', () => UiFinder.exists(SugarBody.body(), selector));

  const pAssertMenuClosed = (selector: string) =>
    Waiter.pTryUntil('Wait for a specific menu to be closed', () => UiFinder.notExists(SugarBody.body(), selector));

  it('TINY-7399: Clicking on the editor should close the menu', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    TinyUiActions.clickOnMenu(editor, fileMenuButtonSelector);
    await pAssertMenuOpen(fileMenuSelector);
    TinyContentActions.trueClick(editor);
    await pAssertMenuClosed(fileMenuSelector);
    McEditor.remove(editor);
  });

  it('TINY-7399: Clicking on the editor should close the context menu', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    TinyContentActions.trueClick(editor);
    await TinyUiActions.pTriggerContextMenu(editor, 'p', contextMenuItemSelector);
    await pAssertMenuOpen(contextMenuItemSelector);
    TinyContentActions.trueClick(editor);
    await pAssertMenuClosed(contextMenuItemSelector);
    McEditor.remove(editor);
  });

  it('TINY-7399: Clicking on the editor should close other editors menus', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    TinyUiActions.clickOnMenu(editor1, fileMenuButtonSelector);
    await pAssertMenuOpen(fileMenuSelector);
    TinyContentActions.trueClick(editor2);
    await pAssertMenuClosed(fileMenuSelector);
    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });

  it('TINY-7399: Clicking on the editor should close other editors context menus', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    await TinyUiActions.pTriggerContextMenu(editor1, 'p', contextMenuItemSelector);
    await pAssertMenuOpen(contextMenuItemSelector);
    TinyContentActions.trueClick(editor2);
    await pAssertMenuClosed(contextMenuItemSelector);
    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });

  it('TINY-7399: Opening a menu in the editor should close other editor\'s menu', async () => {
    const editor1 = await McEditor.pFromSettings<Editor>(settings);
    const editor2 = await McEditor.pFromSettings<Editor>(settings);

    // Open file menu in first editor
    TinyUiActions.clickOnMenu(editor1, fileMenuButtonSelector);
    await pAssertMenuOpen(fileMenuSelector);
    // Open edit menu in second editor
    Mouse.trueClickOn(TinyDom.container(editor2), editMenuButtonSelector);
    await pAssertMenuClosed(fileMenuSelector);
    await pAssertMenuOpen(editMenuSelector);

    McEditor.remove(editor1);
    McEditor.remove(editor2);
  });
});
