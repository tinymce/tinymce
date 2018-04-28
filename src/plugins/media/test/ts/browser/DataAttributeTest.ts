import { GeneralSteps, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.DataAttributeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  const sTestEmbedContentFromUrlWithAttribute = function (ui, url, content) {
    return GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sPasteSourceValue(ui, url),
      Utils.sAssertEmbedContent(ui, content),
      Utils.sSubmitAndReopen(ui),
      Utils.sAssertSourceValue(ui, url),
      Utils.sCloseDialog(ui)
    ]);
  };
  const sTestEmbedContentFromUrl2 = function (ui, url, url2, content, content2) {
    return GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sPasteSourceValue(ui, url),
      Utils.sAssertEmbedContent(ui, content),
      Utils.sSubmitAndReopen(ui),
      Utils.sAssertSourceValue(ui, url),
      Utils.sPasteSourceValue(ui, url2),
      Utils.sAssertEmbedContent(ui, content2),
      Utils.sCloseDialog(ui)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    Pipeline.async({}, [
      sTestEmbedContentFromUrlWithAttribute(ui,
        'a',
        '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
      ),
      sTestEmbedContentFromUrl2(ui, 'a', 'b',
        '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>',
        '<div data-ephox-embed-iri="b" style="max-width: 300px; max-height: 150px"></div>'
      ),
      Utils.sTestEmbedContentFromUrl(ui,
        'a',
        '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
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
      resolve({ html: '<div data-ephox-embed-iri="' + data.url + '" style="max-width: 300px; max-height: 150px"></div>' });
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
