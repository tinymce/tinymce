import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';

describe('browser.tinymce.plugins.help.PluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'help',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Assert Help Plugin list contains Help', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    await PluginAssert.pAssert(
      'Failed to find `Help` plugin',
      {
        'a:contains("Help")': 1
      },
      selectors.dialog,
      selectors.pluginsTab
    );
    TinyUiActions.closeDialog(editor);
  });

  const assertButtonNativelyEnabled = (editor: Editor, selector: string) => UiFinder.exists(TinyDom.container(editor), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);
  const pAssertMenuItemEnabled = (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="false"]`);

  it('TINY-11264: Help toolbar button and menu item should be enabled at all time', async () => {
    const editor = hook.editor();

    assertButtonNativelyEnabled(editor, 'help');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Help")');
    await pAssertMenuItemEnabled(editor, 'Help');
    TinyUiActions.keystroke(editor, Keys.escape());

    editor.mode.set('readonly');
    assertButtonNativelyEnabled(editor, 'help');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("Help")');
    await pAssertMenuItemEnabled(editor, 'Help');
    TinyUiActions.keystroke(editor, Keys.escape());

    editor.mode.set('design');
  });

  it('TINY-11264: Help dialog cancel button should be enabled at all time', async () => {
    const editor = hook.editor();

    editor.mode.set('readonly');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="help"]');
    await TinyUiActions.pWaitForDialog(editor);
    UiFinder.exists(SugarBody.body(), `[data-mce-name="Close"]:not([disabled="disabled"])`);
    TinyUiActions.closeDialog(editor);

    editor.mode.set('design');
  });
});
