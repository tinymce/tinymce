import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import SilverTheme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewContentCssTest', (success, failure) => {

  PreviewPlugin();
  SilverTheme();

  const sAssertIframeHtmlContains = (editor: Editor, text: string) => {
    return Logger.t('Assert Iframe Html contains ' + text, Step.sync(() => {
      const actual = IframeContent.getPreviewHtml(editor);
      const regexp = new RegExp(text);

      Assert.eq('Should be same html', true, regexp.test(actual));
    }));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');

    Pipeline.async({},
      Log.steps('TBA', 'Preview: Set content, set content_css_cors and assert link elements. Delete setting and assert crossOrigin attr is removed', [
        tinyApis.sSetContent('<p>hello world</p>'),
        tinyApis.sSetSetting('content_css_cors', true),
        sAssertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous">`),
        tinyApis.sSetSetting('content_css_cors', false),
        sAssertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}">`)
    ])
    , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/js/tinymce/skins/content/default/content.css'
  }, success, failure);
});
