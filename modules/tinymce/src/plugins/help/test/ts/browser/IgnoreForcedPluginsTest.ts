import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';

describe('browser.tinymce.plugins.help.IgnoreForcedPluginsTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'help',
    toolbar: 'help',
    forced_plugins: [ 'link' ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ HelpPlugin, LinkPlugin ]);

  it('TBA: Hide forced plugins from Help plugin list', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    await PluginAssert.pAssert(
      'Could not ignore forced plugin: link',
      {
        'li a:contains("Help")': 1,
        'li a:contains("Link")': 0
      },
      selectors.dialog,
      selectors.pluginsTab
    );
  });
});
