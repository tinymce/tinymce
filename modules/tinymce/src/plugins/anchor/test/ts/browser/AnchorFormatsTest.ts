import { Log, Step, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorFormatsTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sTestMatchFormat = (editor: Editor, expected: boolean) => Step.sync(() => {
      const match = editor.formatter.match('namedAnchor');
      Assert.eq(`Expected format match to be ${expected}`, expected, match);
    });

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6236', 'Anchor: Check that namedAnchor format matches on empty named anchor', [
        tinyApis.sSetContent('<p><a id="abc"></a></p>'),
        tinyApis.sSelect('a', []),
        sTestMatchFormat(editor, true)
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check that namedAnchor format matches on non-empty named anchor', [
        tinyApis.sSetContent('<p><a id="abc">abc</a></p>'),
        // Note: Browser check since selection is unstable on IE11 due to TINY-3799
        Env.browser.isIE() ? tinyApis.sSelect('a', []) : tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
        sTestMatchFormat(editor, true)
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check that namedAnchor format does not match on normal text', [
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
        sTestMatchFormat(editor, false)
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check that namedAnchor format does not match on bare anchor', [
        tinyApis.sSetContent('<p><a>abc</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
        sTestMatchFormat(editor, false)
      ]),
      Log.stepsAsStep('TINY-6236', 'Anchor: Check that namedAnchor format does not match on normal link', [
        tinyApis.sSetContent('<p><a href="http://www.test.com">http://www.test.com</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
        sTestMatchFormat(editor, false),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3),
        sTestMatchFormat(editor, false)
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    allow_html_in_named_anchor: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
