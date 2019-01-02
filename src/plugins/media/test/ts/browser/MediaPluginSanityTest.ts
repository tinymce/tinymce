import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.MediaPluginSanityTest', function (success, failure) {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Media: Embed content, open dialog, set size and assert constrained and unconstrained size recalculation', [
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
        Utils.sAssertSizeRecalcConstrainedReopen(ui)
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
