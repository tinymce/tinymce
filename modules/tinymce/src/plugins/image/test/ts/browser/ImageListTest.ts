import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cAssertInputValue, cSetInputValue, cSetSelectValue, generalTabSelectors } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageListTest', (success, failure) => {

SilverTheme();
ImagePlugin();

TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
  const tinyApis = TinyApis(editor);
  const tinyUi = TinyUi(editor);

  Pipeline.async({}, [
    Log.stepsAsStep('TBA', 'Image: click image list, check that source changes, change source and check that image list changes', [
      tinyApis.sSetSetting('image_list', [
        { title: 'Dog', value: 'mydog.jpg' },
        { title: 'Cat', value: 'mycat.jpg' }
      ]),
      tinyUi.sClickOnToolbar('click image button', 'button[aria-label="Insert/edit image"]'),
      tinyUi.sWaitForPopup('wait for dialog', 'div[role="dialog"]'),
      Chain.asStep({}, [
        cSetSelectValue(generalTabSelectors.images, 'mydog.jpg')
      ]),
      Chain.asStep({}, [
        cAssertInputValue(generalTabSelectors.src, 'mydog.jpg'),
        cSetInputValue(generalTabSelectors.src, 'mycat.jpg'),
        cAssertInputValue(generalTabSelectors.src, 'mycat.jpg')
      ])
    ])
  ], onSuccess, onFailure);
}, {
  theme: 'silver',
  plugins: 'image',
  toolbar: 'image',
  base_url: '/project/tinymce/js/tinymce'
}, success, failure);
});
