import { Keys, Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SelectorFilter, TextContent } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

import { selectors } from '../module/Selectors';
import FakePlugin from '../module/test/FakePlugin';
import NoMetaFakePlugin from '../module/test/NoMetaFakePlugin';

describe('browser.tinymce.plugins.help.PluginTabsOrderTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'help fake nometafake',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, FakePlugin, NoMetaFakePlugin ]);

  const pExtractItemsFrom = async (editor: Editor, selector: string): Promise<string[]> => {
    const list = await TinyUiActions.pWaitForUi(
      editor,
      selector
    );

    return Arr.map(
      // We want to exclude the "read-more link at the bottom"
      SelectorFilter.children(list, `li:not(.${selectors.pluginsTabLists.readMoreClass})`),
      (x) => TextContent.get(x) ?? ''
    );
  };

  const pTestPluginItems = async (label: string, editor: Editor, selector: string): Promise<void> => {
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    const dialog = await TinyUiActions.pWaitForUi(editor, selectors.dialog);
    Mouse.clickOn(dialog, selectors.pluginsTab);
    const rawEntries = await pExtractItemsFrom(editor, selector);
    assert.deepEqual(
      rawEntries,
      Arr.sort(rawEntries, (s1, s2) => s1.localeCompare(s2)),
      `${label} were not sorted alphabetically`
    );

    // Close the dialog after a successful assertion.
    TinyUiActions.keystroke(editor, Keys.escape(), { });
  };

  it('TINY-9019: Installed Plugin Lists are alphabetically ordered', async () => {
    const editor = hook.editor();
    await pTestPluginItems('Installed Plugins', editor, selectors.pluginsTabLists.installed);
  });

  it('TINY-9019: Available Plugin Lists are alphabetically ordered', async () => {
    const editor = hook.editor();
    await pTestPluginItems('Available Plugins', editor, selectors.pluginsTabLists.available);
  });
});
