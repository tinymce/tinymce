import { Pipeline, UiFinder, GeneralSteps, Chain, Logger, UiControls, Assertions, Mouse } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { Element, Attr } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

const cFakeEvent = function (name) {
  return Chain.label('Fake event',
    Chain.op(function (elm: Element) {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      elm.dom().dispatchEvent(evt);
    })
  );
};

const cCloseDialog = Chain.fromChains([
  UiFinder.cFindIn('button:contains("Cancel")'),
  Mouse.cClick
]);

const cFindByLabelFor = (labelText: string) => Chain.binder((outer: Element) => {
  return UiFinder.findIn(outer, 'label:contains("' + labelText + '")').bind((labelEle) => {
    return UiFinder.findIn(outer, '#' + Attr.get(labelEle, 'for'));
  });
});

UnitTest.asynctest('browser.tinymce.plugins.link.UrlInputTest', (success, failure) => {
  Theme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('insert url by typing', GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('click on link button', 'button[aria-label="Insert/edit link"]'),
        Chain.asStep({}, [
          Chain.fromParent(tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
            [
              Chain.fromChains([
                cFindByLabelFor('URL'),
                UiControls.cSetValue('http://www.test.com/'),
                cFakeEvent('input')
              ]),
              Chain.fromChains([
                cFindByLabelFor('Text to display'),
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
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
