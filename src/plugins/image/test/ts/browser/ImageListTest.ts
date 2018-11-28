import { Assertions, Chain, Log, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cFakeEvent } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageListTest', (success, failure) => {

SilverTheme();
ImagePlugin();

TinyLoader.setup(function (editor, onSuccess, onFailure) {
  const tinyApis = TinyApis(editor);
  const tinyUi = TinyUi(editor);

  Pipeline.async({}, [
    Log.stepsAsStep('TBA', 'Image: click image list, check that source changes, change source and check that image list changes', [
      tinyApis.sSetSetting('image_list', [
        { title: 'Dog', value: 'mydog.jpg' },
        { title: 'Cat', value: 'mycat.jpg' }
      ]),
      tinyUi.sClickOnToolbar('click image button', 'button[aria-label="Insert/edit image"]'),
      Chain.asStep({}, [
        tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
        UiFinder.cFindIn('select'),
        UiControls.cSetValue('mydog.jpg'),
        cFakeEvent('change')
      ]),
      Chain.asStep({}, [
        Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
          [
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Source")'),
              Chain.mapper(function (val) {
                const inputElm = document.getElementById(val.dom().htmlFor);
                return TinyDom.fromDom(inputElm);
              }),
              UiControls.cGetValue,
              Assertions.cAssertEq('should be dog', 'mydog.jpg')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('label:contains("Source") + .tox-form__controls-h-stack input'),
              UiControls.cSetValue('mycat.jpg'),
              cFakeEvent('change')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('select'),
              UiControls.cGetValue,
              Assertions.cAssertEq('should be cat', 'mycat.jpg')
            ])
          ]
        )
      ])
    ])
  ], onSuccess, onFailure);
}, {
  theme: 'silver',
  plugins: 'image',
  toolbar: 'image',
  skin_url: '/project/js/tinymce/skins/oxide/'
}, success, failure);
});
