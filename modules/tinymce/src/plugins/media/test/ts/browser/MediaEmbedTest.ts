import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.MediaEmbedTest', function (success, failure) {

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Media: Embed content, open dialog, set size and assert custom media_url_resolver formatting', [
        Utils.sTestEmbedContentFromUrl(api, ui,
          'https://www.youtube.com/watch?v=b3XFjWInBog',
          '<video width="300" height="150" controls="controls">\n' +
          '<source src="https://www.youtube.com/watch?v=b3XFjWInBog" />\n</video>'
        ),
        Utils.sTestEmbedContentFromUrl(api, ui,
          'https://www.google.com',
          '<video width="300" height="150" controls="controls">\n' +
          '<source src="https://www.google.com" />\n</video>'
        ),
        Utils.sAssertSizeRecalcConstrained(ui),
        Utils.sAssertSizeRecalcUnconstrained(ui),
        api.sSetContent(''),
        Utils.sAssertSizeRecalcConstrainedReopen(ui)
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    media_url_resolver (data, resolve) {
      resolve({
        html: '<video width="300" height="150" ' +
          'controls="controls">\n<source src="' + data.url + '" />\n</video>'
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
