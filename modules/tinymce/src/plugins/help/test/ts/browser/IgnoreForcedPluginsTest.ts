import { after, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import { tinymce } from 'tinymce/core/api/Tinymce';
import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';

describe('browser.tinymce.plugins.help.IgnoreForcedPluginsTest', () => {
  before(() => {
    tinymce.PluginManager.add('onboarding', Fun.noop);
  });

  after(() => {
    tinymce.PluginManager.remove('onboarding');
  });

  const hook = TinyHooks.bddSetupLight({
    plugins: [ 'help', 'onboarding' ],
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

  it('TINY-11976: Hide onboarding plugin from Help plugin list', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    await PluginAssert.pAssert(
      'Could not ignore onboarding plugin',
      { 'li:contains("onboarding")': 0 },
      selectors.dialog,
      selectors.pluginsTab
    );
  });
});
