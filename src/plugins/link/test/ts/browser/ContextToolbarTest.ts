import { Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.link.ContextToolbarTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      // no toolbar on by default
      tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
      Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'a'),
      UiFinder.sNotExists(TinyDom.fromDom(editor.getBody()), 'div[aria-label="Open link"]'),
      tinyApis.sSetContent(''),

      // only after setting set to true
      tinyApis.sSetSetting('link_context_toolbar', true),
      tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
      Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'a'),
      tinyUi.sWaitForUi('wait for open button', 'div[aria-label="Open link"]')
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
