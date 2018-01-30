import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.MediaEmbedTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    Pipeline.async({}, [
      Utils.sTestEmbedContentFromUrl(ui,
        'https://www.youtube.com/watch?v=b3XFjWInBog',
        '<video width="300" height="150" controls="controls">\n' +
        '<source src="https://www.youtube.com/watch?v=b3XFjWInBog" />\n</video>'
      ),
      Utils.sTestEmbedContentFromUrl(ui,
        'https://www.google.com',
        '<video width="300" height="150" controls="controls">\n' +
        '<source src="https://www.google.com" />\n</video>'
      ),
      Utils.sAssertSizeRecalcConstrained(ui),
      Utils.sAssertSizeRecalcUnconstrained(ui),
      api.sSetContent(''),
      Utils.sAssertSizeRecalcConstrainedReopen(ui)
    ], onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    media_url_resolver (data, resolve) {
      resolve({
        html: '<video width="300" height="150" ' +
          'controls="controls">\n<source src="' + data.url + '" />\n</video>'
      });
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
