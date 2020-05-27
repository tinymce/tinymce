import { Step, Log, ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableFormatsTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const beforeTable = ({ cell1 = false, cell2 = false, cell3 = false, cell4 = false } = {}) =>
      '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;" ${cell1 ? 'data-mce-selected="1"' : ''}>a</td>` +
      `<td style="width: 50%;" ${cell2 ? 'data-mce-selected="1"' : ''}>b</td>` +
      '</tr>' +
      '<tr>' +
      `<td style="width: 50%;" ${cell3 ? 'data-mce-selected="1"' : ''}>c</td>` +
      `<td style="width: 50%;" ${cell4 ? 'data-mce-selected="1"' : ''}>d</td>` +
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
              s.element('tr', {
                children: [
                  s.element('td', {
                    styles: {
                      width: str.is('50%'),
                      ...cell3 ? mapStyles(styles, str) : {}
                    },
                    children: [
                      s.text(str.is('c'))
                    ]
                  }),
                  s.element('td', {
                    styles: {
                      width: str.is('50%'),
                      ...cell4 ? mapStyles(styles, str) : {}
                    },
                    children: [
                      s.text(str.is('d'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })));

    const sApplyFormat = (editor: Editor, formatName: string, vars: Record<string, any>) => Step.sync(() => editor.formatter.apply(formatName, vars));
    const sRemoveFormat = (editor: Editor, formatName: string, vars: Record<string, any>) => Step.sync(() => editor.formatter.remove(formatName, vars));

    const stestTableCellFormat = (formatName: string, vars: Record<string, string>, styles: Record<string, string>) =>
      Log.stepsAsStep('TINY-6004', `Table Cell Format: ${formatName}`, [
        Log.stepsAsStep('TINY-6004', 'Apply format to empty editor', [
          tinyApis.sSetContent(''),
          tinyApis.sFocus(),
          sApplyFormat(editor, formatName, vars),
          tinyApis.sAssertContent('')
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on single cell with cursor in it', [
          tinyApis.sSetContent(beforeTable()),
          tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on single cell selection (cell)', [
          tinyApis.sSetContent(beforeTable({ cell1: true })),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (row)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true })),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true, cell2: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (col)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell3: true })),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true, cell3: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (table)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true })),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true, cell2: true, cell3: true, cell4: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on single cell with cursor in it then remove format', [
          tinyApis.sSetContent(beforeTable()),
          tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true }),
          sRemoveFormat(editor, formatName, vars),
          sAsserTableCellStructure(),
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (table) then remove format', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true })),
          sApplyFormat(editor, formatName, vars),
          sAsserTableCellStructure(styles, { cell1: true, cell2: true, cell3: true, cell4: true }),
          sRemoveFormat(editor, formatName, vars),
          sAsserTableCellStructure(),
        ]),
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      stestTableCellFormat('tablecellbackgroundcolor', { value: 'red'  }, { 'background-color': 'red' }),
      stestTableCellFormat('tablecellbordercolor', { value: 'red'  }, { 'border-color': 'red' }),
      stestTableCellFormat('tablecellborderstyle', { value: 'dashed'  }, { 'border-style': 'dashed' }),
      stestTableCellFormat('tablecellborderwidth', { value: '5px'  }, { 'border-width': '5px' })
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});

