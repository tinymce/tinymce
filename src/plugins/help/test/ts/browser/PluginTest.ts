import { Pipeline, Mouse, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import PluginAssert from '../module/PluginAssert';
import Selectors from '../module/Selectors';

UnitTest.asynctest('browser.plugin.PluginTest', (success, failure) => {

  Theme();
  HelpPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Help: Assert Help Plugin list contains Help', [
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), Selectors.toolbarHelpButton),
        PluginAssert.sAssert(
          'Failed to find `Help` plugin',
          {
            'a:contains("Help")': 1
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
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
