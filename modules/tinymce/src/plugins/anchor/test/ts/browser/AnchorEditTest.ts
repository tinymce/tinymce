import { Pipeline, Step, Logger, Log } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorEditTest', (success, failure) => {
  AchorPlugin();
  Theme();

  const sType = function (text) {
    return Logger.t('Add anchor' + text, Step.sync(function () {
      const elm: any = document.querySelector('div[role="dialog"].tox-dialog input');
      elm.value = text;
    }));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Anchor: Add anchor, change anchor, undo anchor then the anchor should be there as first entered', [
        tinyApis.sFocus,
        tinyApis.sSetContent('abc'),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
        sType('abc'),
        tinyUi.sClickOnUi('click on Save btn', '.tox-dialog__footer .tox-button:not(.tox-button--secondary)'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 }),
        tinyApis.sSelect('a.mce-item-anchor', []),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
        sType('def'),
        tinyUi.sClickOnUi('click on Save btn', '.tox-dialog__footer .tox-button:not(.tox-button--secondary)'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#def': 1 }),
        tinyApis.sExecCommand('undo'),
        tinyApis.sSetCursor([], 0),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 })
      ])
    , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
