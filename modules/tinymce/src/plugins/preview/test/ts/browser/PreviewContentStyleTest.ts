import { Pipeline, RawAssertions, Step, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewContentStyleTest', (success, failure) => {

  PreviewPlugin();
  SilverTheme();

  const sAssertIframeContains = (editor, text, expected) => Step.sync(() => {
    const actual = IframeContent.getPreviewHtml(editor);
    const regexp = new RegExp(text);

    RawAssertions.assertEq('Should be same html', expected, regexp.test(actual));
  });

  const sAssertIframeHtmlContains = function (editor, text) {
    return Logger.t('Assert Iframe Html contains ' + text, sAssertIframeContains(editor, text, true));
  };

  const sAssertIframeHtmlNotContains = function (editor, text) {
    return Logger.t('Assert Iframe Html does not contain ' + text, sAssertIframeContains(editor, text, false));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Preview: Set content, set style setting and assert content and style. Delete style and assert style is removed', [
        tinyApis.sSetContent('<p>hello world</p>'),
        tinyApis.sSetSetting('content_style', 'p {color: blue;}'),
        sAssertIframeHtmlContains(editor, '<style type="text/css">p {color: blue;}</style>'),
        tinyApis.sDeleteSetting('content_style'),
        sAssertIframeHtmlNotContains(editor, '<style type="text/css">p {color: blue;}</style>')
    ])
    , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
