import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.MediaPluginSanityTest', function (success, failure) {
  Plugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Media: Embed content, open dialog, set size and assert constrained and unconstrained size recalculation', [apis.sSetContent(''),
        Utils.sTestEmbedContentFromUrl(ui,
          'www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(ui,
          'http://www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(ui,
          'https://www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(ui,
          'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
          '<iframe src="//www.youtube.com/embed/cOTbVN2qZBY?t=30s&amp;index=2&amp;list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(ui,
          'https://www.google.com',
          '<video width="300" height="150" controls="controls">\n<source src="https://www.google.com" />\n</video>'
        ),
        Utils.sAssertSizeRecalcConstrained(ui),
        Utils.sAssertSizeRecalcUnconstrained(ui),
        Utils.sAssertSizeRecalcConstrainedReopen(ui),
        Utils.sCloseDialog(ui)
      ]),
      Log.stepsAsStep('TINY-4857', 'Media: Test embed with XSS attack sanitized', [
        apis.sSetContent(''),
        Utils.sOpenDialog(ui),
        Utils.sPasteTextareaValue(ui, '<video controls="controls" width="300" height="150"><source src="a" onerror="alert(1)" /></video>'),
        Utils.sSubmitDialog(ui),
        Utils.sAssertEditorContent(apis, editor, '<p><video controls="controls" width="300" height="150"><source src="a" /></video></p>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'modern',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});