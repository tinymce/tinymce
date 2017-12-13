import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import AchorPlugin from 'tinymce/plugins/anchor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorSanityTest.js', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  AchorPlugin();
  ModernTheme();

  var sType = function (text) {
    return Step.sync(function () {
      var elm: any = document.querySelector('div[aria-label="Anchor"].mce-floatpanel input');
      elm.value = text;
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyUi = TinyUi(editor);
    var tinyApis = TinyApis(editor);

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
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

