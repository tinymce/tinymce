import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sTableSizingModeScenarioTest } from '../../module/test/TableSizingModeCommandUtil';

UnitTest.asynctest('browser.tinymce.plugins.table.command.TableSizingModeCommandWithColGroupsTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'Percent (relative) to pixel (fixed) sizing', true, {
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'fixed',
        expectedTableWidth: 800,
        expectedWidths: [[ 400, 400 ]]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'Percent (relative) to none (responsive) sizing', true, {
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [[ null, null ]]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'Pixel (fixed) to percent (relative) sizing', true, {
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'relative',
        expectedTableWidth: 75,
        expectedWidths: [[ 50, 50 ]]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'Pixel (fixed) to none (responsive) sizing', true, {
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [[ null, null ]]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'None (responsive) to percent (relative) sizing', true, {
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'relative',
        expectedTableWidth: 16,
        expectedWidths: [[ 33, 33, 33 ]]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000, TINY-6050', 'None (responsive) to pixel (fixed) sizing', true, {
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'fixed',
        expectedTableWidth: 133,
        expectedWidths: [[ 44, 44, 44 ]]
      })
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    width: 850,
    content_css: false,
    content_style: 'body { margin: 10px; max-width: 800px }',
    base_url: '/project/tinymce/js/tinymce',
    table_use_colgroups: true
  }, success, failure);
});
