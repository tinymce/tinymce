import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAddAnchor, sAssertAnchorPresence } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorSanityTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Anchor: Add text and anchor, then check if that anchor is present in the editor', [
        tinyApis.sSetContent('abc'),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        tinyApis.sAssertContent('<p><a id="abc"></a>abc</p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor to empty editor, then check if that anchor is present in the editor', [
        tinyApis.sSetContent(''),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        tinyApis.sAssertContent('<p><a id="abc"></a></p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add anchor to empty line, then check if that anchor is present in the editor', [
        tinyApis.sSetContent('<p>abc</p><p></p><p>def</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 1 ], 0),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        tinyApis.sAssertContent('<p>abc</p>\n<p><a id="abc"></a></p>\n<p>def</p>')
      ]),
      Log.stepsAsStep('TINY-2788', 'Anchor: Add two anchors side by side, then check if they are present in the editor', [
        tinyApis.sSetContent(''),
        tinyApis.sFocus(),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        tinyApis.sAssertContent('<p><a id="abc"></a></p>'),
        sAddAnchor(tinyApis, tinyUi, 'def'),
        sAssertAnchorPresence(tinyApis, 2),
        tinyApis.sAssertContent('<p><a id="abc"></a><a id="def"></a></p>')
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check bare anchor can be converted to a named anchor', [
        tinyApis.sSetContent('<p><a>abc</a></p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sAddAnchor(tinyApis, tinyUi, 'abc'),
        sAssertAnchorPresence(tinyApis, 1),
        // Text is shifted outside anchor since 'allow_html_in_named_anchor' setting is false by default
        tinyApis.sAssertContent('<p><a id="abc"></a>abc</p>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
