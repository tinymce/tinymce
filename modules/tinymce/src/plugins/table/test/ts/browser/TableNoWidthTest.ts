import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableNoWidthTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6051', 'Removing and adding a column doesn\'t add sizes', [
        tinyApis.sSetContent('<table><tbody><tr><td>Col 1</td><td>Col 2</td></tr></tbody></table>'),
        tinyApis.sSetCursor([ 0, 0, 0, 1 ], 0),
        tinyApis.sExecCommand('mceTableDeleteCol'),
        tinyApis.sAssertContent('<table><tbody><tr><td>Col 1</td></tr></tbody></table>'),
        tinyApis.sExecCommand('mceTableInsertColAfter'),
        tinyApis.sAssertContent('<table><tbody><tr><td>Col 1</td><td>&nbsp;</td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TINY-6051', 'Removing and adding a row doesn\'t add sizes', [
        tinyApis.sSetContent('<table><tbody><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></tbody></table>'),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        tinyApis.sExecCommand('mceTableDeleteRow'),
        tinyApis.sAssertContent('<table><tbody><tr><td>Row 2</td></tr></tbody></table>'),
        tinyApis.sExecCommand('mceTableInsertRowBefore'),
        tinyApis.sAssertContent('<table><tbody><tr><td>&nbsp;</td></tr><tr><td>Row 2</td></tr></tbody></table>')
      ]),
      Log.stepsAsStep('TINY-6051', 'Merging and splitting a cell doesn\'t add sizes', [
        tinyApis.sSetContent('<table><tbody><tr><td data-mce-selected="1" data-mce-first-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1" data-mce-last-selected="1">3</td><td>4</td></tr></tbody></table>'),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        tinyApis.sExecCommand('mceTableMergeCells'),
        tinyApis.sAssertContent('<table><tbody><tr><td rowspan="2">1<br />3</td><td>2</td></tr><tr><td>4</td></tr></tbody></table>'),
        tinyApis.sExecCommand('mceTableSplitCells'),
        tinyApis.sAssertContent('<table><tbody><tr><td>1<br />3</td><td>2</td></tr><tr><td>&nbsp;</td><td>4</td></tr></tbody></table>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
