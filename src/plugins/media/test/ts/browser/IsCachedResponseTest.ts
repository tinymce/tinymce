import {
    Assertions, Chain, GeneralSteps, Guard, Logger, Mouse, Pipeline, UiControls, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Html } from '@ephox/sugar';

import MediaPlugin from 'tinymce/plugins/media/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.IsCachedResponseTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  MediaPlugin();

  const cAssertEmbedValue = function (expected) {
    return Chain.control(
      Chain.fromChains([
        UiFinder.cFindIn('label:contains("Paste your embed code below:")'),
        Chain.mapper(function (elm) {
          return TinyDom.fromDom(document.getElementById(elm.dom().htmlFor));
        }),
        UiControls.cGetValue,
        Assertions.cAssertHtml('has expected html', expected)
      ]),
      Guard.tryUntil('did not get correct html', 10, 3000)
    );
  };

  const sWaitForAndAssertNotification = function (expected) {
    return Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Could not find notification', 'div.mce-notification-inner'),
      Chain.mapper(Html.get),
      Assertions.cAssertHtml('Plugin list html does not match', expected)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('test cached response', GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('click media button', 'div[aria-label="Insert/edit media"] > button'),
        Chain.asStep({}, [
          Chain.fromParent(
            tinyUi.cWaitForPopup('wait for media dialog', 'div[role="dialog"]'), [
              Chain.fromChains([
                Utils.cSetSourceInput(tinyUi, 'test'),
                Utils.cFakeEvent('paste')
              ]),
              Chain.fromChains([
                cAssertEmbedValue('<div>x</div>')
              ]),
              Chain.fromChains([
                Utils.cSetSourceInput(tinyUi, 'XXX')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Ok")'),
                Mouse.cClick
              ])
            ])
        ]),
        sWaitForAndAssertNotification('Media embed handler threw unknown error.'),
        tinyApis.sAssertContent('')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'media',
    toolbar: 'media',
    skin_url: '/project/js/tinymce/skins/lightgray',
    media_url_resolver (data, resolve, reject) {
      if (data.url === 'test') {
        resolve({
          html: '<div>x</div>' });
      } else {
        reject('error');
      }
    }
  }, success, failure);
});
