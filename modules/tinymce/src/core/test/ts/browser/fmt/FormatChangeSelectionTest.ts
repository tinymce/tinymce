import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.fmt.FormatChangeSelectionTest', (success, failure) => {

  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<p><em><strong>a </strong>b<strong> c</strong></em></p>'),
      tinyApis.sSetSelection([ 0, 0, 1 ], 0, [ 0, 0, 2 ], 0),
      tinyApis.sExecCommand('italic'),
      tinyApis.sAssertContent('<p><em><strong>a </strong></em>b<em><strong> c</strong></em></p>'),
      tinyApis.sAssertSelection([ 0, 1 ], 0, [ 0, 2 ], 0)
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
