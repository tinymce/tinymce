import { Step, Log, ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.ApplyCellStyleCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const beforeTable = ({ cell1 = false, cell2 = false } = {}) =>
      '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;" ${cell1 ? 'data-mce-selected="1"' : ''}>a</td>` +
      `<td style="width: 50%;" ${cell2 ? 'data-mce-selected="1"' : ''}>b</td>` +
      '</tr>' +
      '</tbody>' +
      '</table>';

    const mapStyles = (styles: Record<string, string>, str) => Obj.map(styles, (val, _key) => str.is(val));

    const sAsserTableCellStructure = (styles: Record<string, string> = {}, { cell1 = false, cell2 = false, cell3 = false, cell4 = false } = {}) =>
      TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
        styles: {
          'width': str.is('100%'),
          'border-collapse': str.is('collapse')
        },
        attrs: {
          border: str.is('1')
        },
        children: [
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('td', {
                    styles: {
                      width: str.is('50%'),
                      ...cell1 ? mapStyles(styles, str) : {}
                    },
                    children: [
                      s.text(str.is('a'))
                    ]
                  }),
                  s.element('td', {
                    styles: {
                      width: str.is('50%'),
                      ...cell2 ? mapStyles(styles, str) : {}
                    },
                    children: [
                      s.text(str.is('b'))
                    ]
                  })
                ]
              }),
            ]
          })
        ]
      })));

    const sApplyCellStyle = (editor: Editor, args: Record<string, any>) => Step.sync(() => editor.execCommand('mceTableApplyCellStyle', false, args));

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TINY-6004', `Apply command on empty editor`, [
        tinyApis.sSetContent(''),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell without any styles specified`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, {}),
        sAsserTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style specified`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { zzzz: 'red' }),
        sAsserTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style value specified`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'zzz' }),
        sAsserTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing single style`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        sAsserTableCellStructure({ 'background-color': 'red' }, { cell1: true }),
        sApplyCellStyle(editor, { backgroundColor: 'blue' }),
        sAsserTableCellStructure({ 'background-color': 'blue' }, { cell1: true }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAsserTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange' }),
        sAsserTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }, { cell1: true }),
        sApplyCellStyle(editor, { borderColor: 'blue' }),
        sAsserTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }, { cell1: true }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAsserTableCellStructure({ 'border-color': 'blue' }, { cell1: true }),
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles with kebab-case`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { 'background-color': 'red', 'border-color': 'orange' }),
        sAsserTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }, { cell1: true }),
        sApplyCellStyle(editor, { 'border-color': 'blue' }),
        sAsserTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }, { cell1: true }),
        sApplyCellStyle(editor, { 'background-color': '' }),
        sAsserTableCellStructure({ 'border-color': 'blue' }, { cell1: true }),
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying and removing all valid styles`, [
        tinyApis.sSetContent(beforeTable()),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange', borderStyle: 'dashed', borderWidth: '5px' }),
        sAsserTableCellStructure(
          { 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' },
          { cell1: true }
        ),
        sApplyCellStyle(editor, {}),
        sAsserTableCellStructure(
          { 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' },
          { cell1: true }
        ),
        sApplyCellStyle(editor, { backgroundColor: '', borderColor: '', borderStyle: '', borderWidth: '' }),
        sAsserTableCellStructure()
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});

