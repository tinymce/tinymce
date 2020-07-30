import { Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAddAnchor } from '../module/Helpers';

UnitTest.asynctest('Browser Test: .AnchorInlineTest', (success, failure) => {
  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({},
      // Note: HTML should not be contained in the anchor because of the allow_html_in_named_anchor setting which is false by default
      Log.steps('TBA', 'Anchor: Add anchor by selecting text content, then check that anchor is inserted correctly', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>abc 123</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 4, [ 0, 0 ], 7),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        sAddAnchor(tinyApis, tinyUi, 'abc', true),
        tinyApis.sAssertContent('<p>abc <a id="abc"></a>123</p>')
      ])
      , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
