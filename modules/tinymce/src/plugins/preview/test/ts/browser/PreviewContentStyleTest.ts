import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';

import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewContentStyleTest', (success, failure) => {

  PreviewPlugin();
  SilverTheme();

  const sAssertIframeContains = (editor, text, expected) => Step.sync(() => {
    const actual = IframeContent.getPreviewHtml(editor);
    const regexp = new RegExp(text);

    Assert.eq('Should be same html', expected, regexp.test(actual));
  });

  const sAssertIframeHtmlContains = (editor, text) => {
    return Logger.t('Assert Iframe Html contains ' + text, sAssertIframeContains(editor, text, true));
  };

  const sAssertIframeHtmlNotContains = (editor, text) => {
    return Logger.t('Assert Iframe Html does not contain ' + text, sAssertIframeContains(editor, text, false));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Preview: Set content, set style setting and assert content and style. Delete style and assert style is removed', [
        tinyApis.sSetContent('<p>hello world</p>'),
        tinyApis.sSetSetting('content_style', 'p {color: blue;}'),
        sAssertIframeHtmlContains(editor, '<style type="text/css">p {color: blue;}</style>'),
        tinyApis.sDeleteSetting('content_style'),
        sAssertIframeHtmlNotContains(editor, '<style type="text/css">p {color: blue;}</style>')
      ]),
      Log.stepsAsStep('TINY-6529', 'Preview: Set content, set style settings and assert content and styles. content_style should take precedence. Delete style and assert style is removed', [
        tinyApis.sSetContent('<p>hello world</p>'),
        tinyApis.sSetSetting('content_css_cors', true),
        tinyApis.sSetSetting('content_style', 'p {color: blue;}'),
        sAssertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous"><style type="text/css">p {color: blue;}</style>`),
        tinyApis.sSetSetting('content_css_cors', false),
        tinyApis.sDeleteSetting('content_style'),
        sAssertIframeHtmlNotContains(editor, '<style type="text/css">p {color: blue;}</style>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
