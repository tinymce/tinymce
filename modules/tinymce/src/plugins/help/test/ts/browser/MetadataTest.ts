import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import FakePlugin from '../module/test/FakePlugin';
import NoMetaFakePlugin from '../module/test/NoMetaFakePlugin';
import PluginAssert from '../module/PluginAssert';

import Selectors from '../module/Selectors';

UnitTest.asynctest('Browser Test: .MetadataTest', (success, failure) => {

  HelpPlugin();
  FakePlugin();
  NoMetaFakePlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Help: Assert Help Plugin list contains getMetadata functionality', [
        ui.sClickOnToolbar('Click help button', Selectors.toolbarHelpButton),
        PluginAssert.sAssert(
          'Failed to list fake plugins',
          {
            'li a:contains("Help")': 1,
            'li a:contains("Fake")': 1,
            'li:contains("nometafake")': 1,
            'button:contains("Close")': 1
          },
          Selectors.dialog,
          Selectors.pluginsTab
        )
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'help fake nometafake',
    toolbar: 'help',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
