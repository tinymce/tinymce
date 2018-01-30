import {
    Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, UiControls, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.image.ImageListTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  ImagePlugin();

  const cFakeEvent = function (name) {
    return Chain.op(function (elm) {
      DOMUtils.DOM.fire(elm.dom(), name);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('click image list, check that source changes, change source and check that image list changes', GeneralSteps.sequence([
        tinyApis.sSetSetting('image_list', [
          { title: 'Dog', value: 'mydog.jpg' },
          { title: 'Cat', value: 'mycat.jpg' }
        ]),
        tinyUi.sClickOnToolbar('click image button', 'div[aria-label="Insert/edit image"] button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
          UiFinder.cFindIn('label:contains("Image list") + div > button'),
          Mouse.cClick
        ]),
        Chain.asStep(TinyDom.fromDom(document.body), [
          UiFinder.cFindIn('div[role="menuitem"] > span:contains("Dog")'),
          Mouse.cClick
        ]),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Source") + div > input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be dog', 'mydog.jpg')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Source") + div > input'),
                UiControls.cSetValue('mycat.jpg'),
                cFakeEvent('change')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Image list") + div > button > span:contains("Cat")')
              ])
            ]
          )
        ])
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'image',
    toolbar: 'image',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
