import { Pipeline, Mouse, Log} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import PluginAssert from '../module/PluginAssert';

import Selectors from '../module/Selectors';

UnitTest.asynctest('browser.plugin.IgnoreForcedPluginsTest', (success, failure) => {
  HelpPlugin();
  LinkPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Help: Hide forced plugins from Help plugin list', [
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), Selectors.toolbarHelpButton),
        PluginAssert.sAssert(
          'Could not ignore forced plugin: link',
          {
            'li a:contains("Help")': 1,
            'li a:contains("Link")': 0
          },
          Selectors.dialog,
          Selectors.pluginsTab
        )
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'help',
    toolbar: 'help',
    theme: 'silver',
    forced_plugins: ['link'],
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
