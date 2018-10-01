import { Mouse, Pipeline, UiFinder, Logger, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.ContextToolbarTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  // NOTE: Have not changed this one. Still using the old theme. Not implemented yet.

  Theme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      tinyApis.sFocus,
      Logger.t('no toolbar on by default', GeneralSteps.sequence([
        tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
        Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'a'),
        UiFinder.sNotExists(TinyDom.fromDom(editor.getBody()), 'div[aria-label="Open link"]'),
        tinyApis.sSetContent('')
      ])),
      Logger.t('only after setting set to true', GeneralSteps.sequence([
        tinyApis.sSetSetting('link_context_toolbar', true),
        tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
        Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'a'),
        tinyUi.sWaitForUi('wait for open button', 'div[aria-label="Open link"]')
      ])),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});
