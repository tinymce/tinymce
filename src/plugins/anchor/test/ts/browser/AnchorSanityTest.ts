import { Pipeline, Step, Waiter } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AchorPlugin from 'tinymce/plugins/anchor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorSanityTest.js', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  AchorPlugin();
  ModernTheme();

  const sType = function (text) {
    return Step.sync(function () {
      const elm: any = document.querySelector('div[aria-label="Anchor"].mce-floatpanel input');
      elm.value = text;
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('abc'),
      tinyApis.sFocus,
      tinyUi.sClickOnToolbar('click anchor button', 'div[aria-label="Anchor"] button'),
      tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].mce-floatpanel  input'),
      sType('abc'),
      tinyUi.sClickOnUi('click on OK btn', 'div.mce-primary > button'),
      Waiter.sTryUntil('wait for anchor',
        tinyApis.sAssertContentPresence(
          { 'a.mce-item-anchor': 1 }
        ), 100, 4000
      )
    ], onSuccess, onFailure);
  }, {
    plugins: 'anchor',
    toolbar: 'anchor',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
