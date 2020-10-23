import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as PluginAssert from '../module/PluginAssert';

import { selectors } from '../module/Selectors';

UnitTest.asynctest('browser.plugin.IgnoreForcedPluginsTest', (success, failure) => {
  HelpPlugin();
  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Help: Hide forced plugins from Help plugin list', [
        ui.sClickOnToolbar('Click help button', selectors.toolbarHelpButton),
        PluginAssert.sAssert(
          'Could not ignore forced plugin: link',
          {
            'li a:contains("Help")': 1,
            'li a:contains("Link")': 0
          },
          selectors.dialog,
          selectors.pluginsTab
        )
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'help',
    toolbar: 'help',
    theme: 'silver',
    forced_plugins: [ 'link' ],
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
