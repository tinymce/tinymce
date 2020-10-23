import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sInsertTableTest } from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertTableTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sInsertTableTest(editor, tinyApis, 'TBA', 2, 2, [
        [ 50, 50 ],
        [ 50, 50 ]
      ], false),
      sInsertTableTest(editor, tinyApis, 'TBA', 1, 2, [
        [ 100 ],
        [ 100 ]
      ], false),
      sInsertTableTest(editor, tinyApis, 'TBA', 2, 1, [
        [ 50, 50 ]
      ], false)
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,' +
           'background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
