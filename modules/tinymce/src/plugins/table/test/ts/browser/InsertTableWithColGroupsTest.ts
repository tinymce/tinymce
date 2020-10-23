import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sInsertTableTest } from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertTableWithColGroupTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sInsertTableTest(editor, tinyApis, 'TINY-6050', 2, 2, [
        [ 50, 50 ],
        [ 50, 50 ]
      ], true),
      sInsertTableTest(editor, tinyApis, 'TINY-6050', 1, 2, [
        [ 100 ],
        [ 100 ]
      ], true),
      sInsertTableTest(editor, tinyApis, 'TINY-6050', 2, 1, [
        [ 50, 50 ]
      ], true)
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
    statusbar: false,
    table_use_colgroups: true
  }, success, failure);
});
