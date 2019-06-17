import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.DefaultLinkTargetTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TBA', 'Link: does not add target if no default is set', [
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 0, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'Link: adds target if default is set', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 1, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
