import { Chain, Mouse, Pipeline, Log } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.charmap.InsertQuotationMarkTest', (success, failure) => {

  CharmapPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Charmap: Open dialog, click on the All tab and click on Quotation Mark and then assert Quotation Mark is inserted', [
        tinyApis.sFocus,
        tinyUi.sClickOnToolbar('click charmap', 'button[aria-label="Special character"]'),
        Chain.asStep({}, [
          Chain.fromParent(
            tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
            [
              Mouse.cClickOn('.tox-dialog__body-nav-item:contains(All)'),
              Mouse.cClickOn('.tox-collection span:contains(")') // Could not get span[data-glyph="\"""] or similar to work...
            ]
          )
        ]),
        tinyApis.sAssertContent('<p>"</p>')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    charmap_append: [[34, 'quotation mark']],
    toolbar: 'charmap',
    theme: 'silver',
    base_url: '/project/js/tinymce',
  }, success, failure);
});
