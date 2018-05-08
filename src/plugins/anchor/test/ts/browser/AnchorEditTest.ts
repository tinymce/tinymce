import { Pipeline, Step, Logger, GeneralSteps } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AchorPlugin from 'tinymce/plugins/anchor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorEditTest', (success, failure) => {
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
      Logger.t('add anchor, change anchor, undo anchor then the anchor should be there as first entered', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('abc'),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].mce-floatpanel  input'),
        sType('abc'),
        tinyUi.sClickOnUi('click on OK btn', 'div.mce-primary > button'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 }),
        tinyApis.sSelect('a.mce-item-anchor', []),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].mce-floatpanel  input'),
        sType('def'),
        tinyUi.sClickOnUi('click on OK btn', 'div.mce-primary > button'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#def': 1 }),
        tinyApis.sExecCommand('undo'),
        tinyApis.sSetCursor([], 0),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 })
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'anchor',
    toolbar: 'anchor',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
