import { ApproxStructure, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.command.ApplyCellStyleCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const table = '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;" >a</td>` +
      `<td style="width: 50%;" >b</td>` +
      '</tr>' +
      '</tbody>' +
      '</table>';

    const mapStyles = (styles: Record<string, string>, str: ApproxStructure.StringApi) => Obj.map(styles, (val, _key) => str.is(val));

    const sAssertTableCellStructure = (styles: Record<string, string> = {}) =>
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
                      ...mapStyles(styles, str)
                    },
                    children: [
                      s.text(str.is('a'))
                    ]
                  }),
                  s.element('td', {
                    styles: {
                      width: str.is('50%')
                    },
                    children: [
                      s.text(str.is('b'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })));

    const sApplyCellStyle = (editor: Editor, args: Record<string, string>) => Step.sync(() => editor.execCommand('mceTableApplyCellStyle', false, args));

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TINY-6004', `Apply command on empty editor`, [
        tinyApis.sSetContent(''),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell without any styles specified`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, {}),
        sAssertTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style specified`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { zzzz: 'red' }),
        sAssertTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style value specified`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'zzz' }),
        sAssertTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing single style`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        sAssertTableCellStructure({ 'background-color': 'red' }),
        sApplyCellStyle(editor, { backgroundColor: 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'blue' }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAssertTableCellStructure()
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }),
        sApplyCellStyle(editor, { borderColor: 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAssertTableCellStructure({ 'border-color': 'blue' })
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles with kebab-case`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { 'background-color': 'red', 'border-color': 'orange' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }),
        sApplyCellStyle(editor, { 'border-color': 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }),
        sApplyCellStyle(editor, { 'background-color': '' }),
        sAssertTableCellStructure({ 'border-color': 'blue' })
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying and removing all valid styles`, [
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange', borderStyle: 'dashed', borderWidth: '5px' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' }),
        sApplyCellStyle(editor, {}),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' }),
        sApplyCellStyle(editor, { backgroundColor: '', borderColor: '', borderStyle: '', borderWidth: '' }),
        sAssertTableCellStructure()
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

