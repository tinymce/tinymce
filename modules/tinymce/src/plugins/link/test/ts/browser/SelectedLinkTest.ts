import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.SelectedLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Link: should not get anchor info if not selected node', [
        TestLinkUi.sClearHistory,
        tinyApis.sSetContent('<p><a href="http://tinymce.com">tiny</a></p>'),
        tinyApis.sSetSelection([0], 1, [0], 1),
        tinyApis.sExecCommand('mcelink'),
        TestLinkUi.sAssertDialogContents({
          href: '',
          text: '',
          title: '',
          target: ''
        }),
        TestLinkUi.sClearHistory
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: '',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
