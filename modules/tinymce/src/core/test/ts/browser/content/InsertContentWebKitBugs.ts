import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.content.InsertContentTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Insert contents on a triple click selection should not produce odd spans', GeneralSteps.sequence([
        tinyApis.sSetContent('<blockquote><p>a</p></blockquote><p>b</p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 1 ], 0),
        tinyApis.sExecCommand('mceInsertContent', '<p>c</p>'),
        tinyApis.sAssertContent('<blockquote><p>c</p></blockquote><p>b</p>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'blockquote { font-size: 12px }' // Needed to produce spans with runtime styles
  }, success, failure);
});
