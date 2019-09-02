import { Pipeline, Step, Waiter, Logger, Log } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi  } from '@ephox/mcagar';
import AchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorSanityTest.js', (success, failure) => {

  AchorPlugin();
  SilverTheme();

  const sType = function (text) {
    return Logger.t('Add anchor' + text, Step.sync(function () {
      const elm: any = document.querySelector('div[role="dialog"].tox-dialog  input');
      elm.value = text;
    }));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Anchor: Add anchor, then check if that anchor is present in the editor', [
        tinyApis.sSetContent('abc'),
        tinyApis.sFocus,
        tinyUi.sClickOnToolbar('click anchor button', 'button[aria-label="Anchor"]'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog  input'),
        sType('abc'),
        tinyUi.sClickOnUi('click on Save btn', 'div.tox-dialog__footer button.tox-button:not(.tox-button--secondary)'),
        Waiter.sTryUntil('wait for anchor',
          tinyApis.sAssertContentPresence(
            { 'a.mce-item-anchor': 1 }
          )
        )
    ])
    , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
