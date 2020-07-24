import { Log, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorSanityTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  const sType = (text: string) =>
    Log.step('TBA', 'Add anchor id', Step.sync(() => {
      const elm: any = document.querySelector('div[role="dialog"].tox-dialog  input');
      elm.value = text;
    }));

  const sAddAnchor = (tinyApis: TinyApis, tinyUi: TinyUi, id: string, numAnchors = 1) =>
    Log.stepsAsStep('TBA', 'Add anchor', [
      tinyUi.sClickOnToolbar('click anchor button', 'button[aria-label="Anchor"]'),
      tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog  input'),
      sType(id),
      tinyUi.sClickOnUi('click on Save btn', 'div.tox-dialog__footer button.tox-button:not(.tox-button--secondary)'),
      Waiter.sTryUntil('wait for anchor',
        tinyApis.sAssertContentPresence(
          { 'a.mce-item-anchor': numAnchors }
        )
      )
    ]);

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Anchor: Add text and anchor, then check if that anchor is present in the editor', [
        tinyApis.sSetContent('abc'),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        tinyApis.sAssertContent('<p><a id="abc"></a>abc</p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor to empty editor, then check if that anchor is present in the editor', [
        tinyApis.sSetContent(''),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        tinyApis.sAssertContent('<p><a id="abc"></a></p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor to empty line, then check if that anchor is present in the editor', [
        tinyApis.sSetContent('<p>abc</p><p></p><p>def</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 1 ], 0),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        tinyApis.sAssertContent('<p>abc</p>\n<p><a id="abc"></a></p>\n<p>def</p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add two anchors side by side, then check if they are present in the editor', [
        tinyApis.sSetContent(''),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        tinyApis.sAssertContent('<p><a id="abc"></a></p>'),
        sAddAnchor(tinyApis, tinyUi, 'def', 2),
        tinyApis.sAssertContent('<p><a id="abc"></a><a id="def"></a></p>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
