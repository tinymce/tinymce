import { Assertions, Chain, Log, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Html } from '@ephox/sugar';
import MediaPlugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.IsCachedResponseTest', (success, failure) => {

  Theme();
  MediaPlugin();

  const sWaitForAndAssertNotification = (expected: string) => {
    return Chain.asStep(TinyDom.fromDom(document.body), [
      UiFinder.cWaitFor('Could not find notification', 'div.tox-notification__body'),
      Chain.mapper(Html.get),
      Assertions.cAssertHtml('Plugin list html does not match', expected)
    ]);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Media: test cached response', [
        tinyUi.sClickOnToolbar('click media button', 'button[aria-label="Insert/edit media"]'),
        Chain.asStep({}, [
          Chain.fromParent(
            tinyUi.cWaitForPopup('wait for media dialog', 'div[role="dialog"]'), [
              Chain.fromChains([
                Utils.cSetSourceInput(tinyUi, 'test'),
                Utils.cFakeEvent('paste'),
                Chain.wait(0) // wait is needed because paste is triggered async
              ]),
              Chain.runStepsOnValue(() => [ Utils.sAssertEmbedData(tinyUi, '<div>x</div>') ]),
              Chain.fromChains([
                Utils.cSetSourceInput(tinyUi, 'XXX')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn(Utils.selectors.saveButton),
                Mouse.cClick
              ])
            ]
          )
        ]),

        sWaitForAndAssertNotification('<p>Media embed handler threw unknown error.</p>'),
        tinyApis.sAssertContent('')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'media',
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    media_url_resolver: (data, resolve, reject) => {
      if (data.url === 'test') {
        resolve({
          html: '<div>x</div>' });
      } else {
        reject('error');
      }
    }
  }, success, failure);
});
