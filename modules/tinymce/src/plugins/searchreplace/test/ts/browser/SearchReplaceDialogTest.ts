import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplaceDialogTest', (success, failure) => {
  Theme();
  SearchreplacePlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'SearchReplace: Test no content selected', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'label:contains("Find") + input.tox-textfield', ''),
        Utils.sCloseDialog(tinyUi)
      ]),
      Log.stepsAsStep('TBA', 'SearchReplace: Test some content selected', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        tinyApis.sSetSelection([0, 0], 5, [0, 0], 9),
        Utils.sOpenDialog(tinyUi),
        Utils.sAssertFieldValue(tinyUi, 'label:contains("Find") + input.tox-textfield', 'fish'),
        Utils.sCloseDialog(tinyUi)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});