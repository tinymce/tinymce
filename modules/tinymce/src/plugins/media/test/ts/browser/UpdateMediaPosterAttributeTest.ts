import { Pipeline, Log, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi, TinyApis } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.plugins.media.UpdateMediaPosterAttributeTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    const source = 'http://test.se';
    const poster1 = 'https://www.google.com/logos/google.jpg';
    const poster2 = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Facebook_icon.jpg';

    const sOpenAdvTab = () => {
      return GeneralSteps.sequence([
        ui.sWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
        ui.sClickOnUi('Switch to Advanced Tab', 'div.tox-tab:contains(Advanced)')
      ]);
    };

    const sCloseDialog = ui.sClickOnUi('Click Save', 'button:contains("Save")');

    Pipeline.async({},
      Log.steps('TBA', 'Media: Assert embed data of the video after updating dimensions and media poster value', [
        Utils.sOpenDialog(ui),
        Utils.sPasteSourceValue(ui, source),
        Utils.sAssertHeightAndWidth(ui, '150', '300'),
        Utils.sChangeWidthValue(ui, '350'),
        Utils.sChangeHeightValue(ui, '100'),
        Utils.sAssertHeightAndWidth(ui, '100', '200'),
        sOpenAdvTab(),
        Utils.sPastePosterValue(ui, poster1),
        Utils.sAssertEmbedData(ui,
          `<video width="200" height="100" controls="controls" poster="${poster1}">\n` +
          `<source src="${source}" />\n</video>`
        ),
        sCloseDialog,
        api.sSelect('img', []),
        Utils.sOpenDialog(ui),
        sOpenAdvTab(),
        Utils.sPastePosterValue(ui, poster2),
        Utils.sAssertEmbedData(ui,
          `<video poster="${poster2}" controls="controls" width="200" height="100">\n` +
          `<source src="${source}" /></video>`
        ),
        sCloseDialog,
        api.sSetContent('')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: ['media'],
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
