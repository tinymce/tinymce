import { Chain } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.charmap.InsertQuotationMarkTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  CharmapPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      tinyUi.sClickOnToolbar('click charmap', 'div[aria-label="Special character"] button'),
      Chain.asStep({}, [
        tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
        UiFinder.cFindIn('div[title="quotation mark"]'),
        Mouse.cClick
      ]),
      tinyApis.sAssertContent('<p>"</p>')

    ], onSuccess, onFailure);
  }, {
    plugins: 'charmap',
    toolbar: 'charmap',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
