import { Chain, Log, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cSetInputValue, cSubmitDialog, generalTabSelectors } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.FigureDeleteTest', (success, failure) => {

  SilverTheme();
  ImagePlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'Image: removing src in dialog should remove figure element', [
        tinyApis.sSetContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>'),
        tinyApis.sSetSelection([], 1, [], 2),
        tinyUi.sClickOnToolbar('click on image button', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          cSetInputValue(generalTabSelectors.src, ''),
          cSubmitDialog()
        ]),
        tinyApis.sAssertContent('')
      ]),

      Log.stepsAsStep('TBA', 'Image: clicking caption textbox removes figure and adds image only', [
        tinyApis.sSetContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>'),
        tinyApis.sSetSelection([], 1, [], 2),
        tinyUi.sClickOnToolbar('click on image button', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          UiFinder.cFindIn('label:contains("Show caption") input[type="checkbox"]'),
          Mouse.cClick,
          cSubmitDialog()
        ]),
        tinyApis.sAssertContentPresence({ img: 1, figure: 0, figcaption: 0 })
      ])

    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    image_caption: true,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
