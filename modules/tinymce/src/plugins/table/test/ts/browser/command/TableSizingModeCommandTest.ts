import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sTableSizingModeScenarioTest } from '../../module/test/TableSizingModeCommandUtil';

UnitTest.asynctest('browser.tinymce.plugins.table.command.TableSizingModeCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'Percent (relative) to pixel (fixed) sizing', false, {
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'fixed',
        expectedTableWidth: 800,
        expectedWidths: [
          [ 400, 400 ],
          [ 400, 400 ],
          [ 400, 400 ]
        ]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'Percent (relative) to none (responsive) sizing', false, {
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [
          [ null, null ],
          [ null, null ],
          [ null, null ]
        ]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'Pixel (fixed) to percent (relative) sizing', false, {
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'relative',
        expectedTableWidth: 75,
        expectedWidths: [
          [ 50, 50 ],
          [ 50, 50 ]
        ]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'Pixel (fixed) to none (responsive) sizing', false, {
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [
          [ null, null ],
          [ null, null ]
        ]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'None (responsive) to percent (relative) sizing', false, {
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'relative',
        expectedTableWidth: 16,
        expectedWidths: [
          [ 31, 31, 31 ],
          [ 31, 31, 31 ]
        ]
      }),
      sTableSizingModeScenarioTest(editor, tinyApis, 'TINY-6000', 'None (responsive) to pixel (fixed) sizing', false, {
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'fixed',
        expectedTableWidth: 133,
        expectedWidths: [
          [ 41, 41, 41 ],
          [ 41, 41, 41 ]
        ]
      })
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    width: 850,
    content_css: false,
    content_style: 'body { margin: 10px; max-width: 800px }',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
