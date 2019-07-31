import { Chain, Mouse, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.charmap.InsertQuotationMarkTest', (success, failure) => {

  CharmapPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
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
              Mouse.cClickOn('.tox-collection .tox-collection__item-icon:contains(")') // Could not get span[data-glyph="\"""] or similar to work...
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
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
