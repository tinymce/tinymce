import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.MediaPluginSanityTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Media: Embed content, open dialog, set size and assert constrained and unconstrained size recalculation', [ apis.sSetContent(''),
        Utils.sTestEmbedContentFromUrl(apis, ui,
          'www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(apis, ui,
          'http://www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="http://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(apis, ui,
          'https://www.youtube.com/watch?v=b3XFjWInBog',
          '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(apis, ui,
          'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
          '<iframe src="https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&amp;index=2&amp;list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT" width="560" height="314" allowFullscreen="1"></iframe>'
        ),
        Utils.sTestEmbedContentFromUrl(apis, ui,
          'https://www.google.com',
          '<video width="300" height="150" controls="controls">\n<source src="https://www.google.com" />\n</video>'
        ),
        Utils.sAssertSizeRecalcConstrained(ui),
        Utils.sAssertSizeRecalcUnconstrained(ui),
        Utils.sAssertSizeRecalcConstrainedReopen(ui)
      ]),
      Log.stepsAsStep('TBA', `Media: Test changing source, width and height doesn't delete other values`, [
        apis.sSetContent(''),
        Utils.sOpenDialog(ui),
        Utils.sSetHeightAndWidth(ui, '300', '300'),
        Utils.sAssertHeightAndWidth(ui, '300', '300'),
        Utils.sChangeHeightValue(ui, ''),
        Utils.sAssertHeightAndWidth(ui, '', '300'),
        Utils.sPasteSourceValue(ui, 'https://youtu.be/G60llMJepZI'),
        Utils.sAssertHeightAndWidth(ui, '314', '300'),
        Utils.sCloseDialog(ui)
      ]),
      Log.stepsAsStep('TINY-4857', 'Media: Test embed with XSS attack sanitized', [
        Utils.sOpenDialog(ui),
        Utils.sPasteTextareaValue(ui, '<video controls="controls" width="300" height="150"><source src="a" onerror="alert(1)" /></video>'),
        ui.sClickOnUi('click save button', Utils.selectors.saveButton),
        Utils.sAssertEditorContent(apis, editor, '<p><video controls="controls" width="300" height="150"><source src="a" /></video></p>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
