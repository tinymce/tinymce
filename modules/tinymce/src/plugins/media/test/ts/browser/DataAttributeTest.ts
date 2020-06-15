import { GeneralSteps, Log, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.plugins.media.DataAttributeTest', function (success, failure) {
  Plugin();
  Theme();

  const sTestEmbedContentFromUrlWithAttribute = function (editor: Editor, api: TinyApis, ui: TinyUi, url: string, content: string) {
    return Logger.t(`Assert embeded ${content} from ${url} with attribute`, GeneralSteps.sequence([
      api.sSetContent(''),
      Utils.sOpenDialog(ui),
      Utils.sPasteSourceValue(ui, url),
      // We can't assert the DOM because tab panels don't render hidden tabs, so we check the data model
      Utils.sAssertEmbedData(ui, content),
      Utils.sSubmitAndReopen(ui),
      Utils.sAssertSourceValue(ui, url),
      Utils.sCloseDialog(ui)
    ]));
  };
  const sTestEmbedContentFromUrl2 = function (editor: Editor, api: TinyApis, ui: TinyUi, url: string, url2: string, content: string, content2: string) {
    return Logger.t(`Assert embeded ${content} from ${url} and ${content2} from ${url2}`, GeneralSteps.sequence([
      api.sSetContent(''),
      Utils.sOpenDialog(ui),
      Utils.sPasteSourceValue(ui, url),
      Utils.sAssertEmbedData(ui, content),
      Utils.sSubmitAndReopen(ui),
      Utils.sAssertSourceValue(ui, url),
      Utils.sPasteSourceValue(ui, url2),
      Utils.sAssertEmbedData(ui, content2),
      Utils.sCloseDialog(ui)
    ]));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Media: Test embeded content from url with attribute', [
        sTestEmbedContentFromUrlWithAttribute(editor, api, ui,
          'a',
          '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
        ),
        sTestEmbedContentFromUrl2(editor, api, ui, 'a', 'b',
          '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>',
          '<div data-ephox-embed-iri="b" style="max-width: 300px; max-height: 150px"></div>'
        ),
        Utils.sTestEmbedContentFromUrl(api, ui,
          'a',
          '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
        ),
        Utils.sAssertSizeRecalcConstrained(ui),
        Utils.sAssertSizeRecalcUnconstrained(ui),
        Utils.sAssertSizeRecalcConstrainedReopen(ui)
      ])
      , onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
    toolbar: 'media',
    theme: 'silver',
    media_url_resolver(data, resolve) {
      resolve({ html: '<div data-ephox-embed-iri="' + data.url + '" style="max-width: 300px; max-height: 150px"></div>' });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
