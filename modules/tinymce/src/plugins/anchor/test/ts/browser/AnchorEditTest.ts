import { Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorEditTest', (success, failure) => {
  AnchorPlugin();
  Theme();

  const sType = (text: string) =>
    Log.step('TBA', 'Add anchor', Step.sync(() => {
      const elm: any = document.querySelector('div[role="dialog"].tox-dialog  input');
      elm.value = text;
    }));

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Anchor: Add anchor, change anchor, undo anchor change then the anchor should be there as first entered', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('abc'),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
        sType('abc'),
        tinyUi.sClickOnUi('click on Save btn', '.tox-dialog__footer .tox-button:not(.tox-button--secondary)'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 }),
        tinyApis.sSelect('a.mce-item-anchor', []),
        tinyUi.sWaitForUi('Anchor toolbar button is highlighted', 'button[aria-label="Anchor"][aria-pressed="true"]'),
        tinyApis.sExecCommand('mceAnchor'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
        sType('def'),
        tinyUi.sClickOnUi('click on Save btn', '.tox-dialog__footer .tox-button:not(.tox-button--secondary)'),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#def': 1 }),
        tinyApis.sExecCommand('undo'),
        tinyApis.sSetCursor([], 0),
        tinyApis.sAssertContentPresence({ 'a.mce-item-anchor#abc': 1 }),
        tinyUi.sWaitForUi('Anchor toolbar button is not highlighted', 'button[aria-label="Anchor"][aria-pressed="false"]')
      ])
      , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
