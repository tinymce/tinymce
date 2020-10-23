import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { sAddAnchor, sAssertAnchorPresence } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorEditTest', (success, failure) => {
  AnchorPlugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Anchor: Add anchor, change anchor, undo anchor change then the anchor should be there as first entered', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('abc'),
        sAddAnchor(tinyApis, tinyUi, 'abc', true),
        sAssertAnchorPresence(tinyApis, 1, 'a.mce-item-anchor#abc'),
        tinyApis.sSelect('a.mce-item-anchor', []),
        tinyUi.sWaitForUi('Anchor toolbar button is highlighted', 'button[aria-label="Anchor"][aria-pressed="true"]'),
        sAddAnchor(tinyApis, tinyUi, 'def', true),
        sAssertAnchorPresence(tinyApis, 1, 'a.mce-item-anchor#def'),
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
