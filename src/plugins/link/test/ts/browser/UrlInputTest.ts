import { Pipeline, UiFinder, GeneralSteps, Chain, Logger, UiControls, Assertions, Mouse } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const cFakeEvent = function (name) {
  return Chain.op(function (elm) {
    DOMUtils.DOM.fire(elm.dom(), name);
  });
};

const cCloseDialog = Chain.fromChains([
  UiFinder.cFindIn('button:contains("Cancel")'),
  Mouse.cClick
]);

UnitTest.asynctest('browser.tinymce.plugins.link.UrlInputTest', (success, failure) => {
  ModernTheme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('insert url by typing', GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('div > label:contains("Url") + div > input'),
                UiControls.cSetValue('http://www.test.com/'),
                cFakeEvent('keyup')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Text to display") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be the same url', 'http://www.test.com/')
              ]),
              cCloseDialog
            ]
          )
        ])

      ])),
      Logger.t('insert url by pasting', GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('div > label:contains("Url") + div > input'),
                UiControls.cSetValue('http://www.test.com/'),
                cFakeEvent('paste')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Text to display") + input'),
                UiControls.cGetValue,
                Assertions.cAssertEq('should be the same url', 'http://www.test.com/')
              ]),
              cCloseDialog
            ]
          )
        ])

      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
