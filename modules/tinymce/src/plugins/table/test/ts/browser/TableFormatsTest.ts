import { ApproxStructure, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

interface SelectedCells {
  cell1?: boolean;
  cell2?: boolean;
  cell3?: boolean;
  cell4?: boolean;
}

UnitTest.asynctest('browser.tinymce.plugins.table.TableFormatsTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const beforeTable = (selectedCells: SelectedCells = {}) => {
      const { cell1, cell2, cell3, cell4 } = selectedCells;
      return '<table style="border-collapse: collapse; width: 100%;" border="1">' +
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
    };

    const sAssertTableCellStructure = (styles: Record<string, string> = {}, selectedCells: SelectedCells = {}) => {
      const { cell1, cell2, cell3, cell4 } = selectedCells;
      const mapStyles = (styles: Record<string, string>, str: ApproxStructure.StringApi) => Obj.map(styles, (val, _key) => str.is(val));
      return TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
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
    };

    const sApplyFormat = (editor: Editor, formatName: string, vars: Record<string, string>) => Step.sync(() => editor.formatter.apply(formatName, vars));
    const sRemoveFormat = (editor: Editor, formatName: string, vars: Record<string, string>) => Step.sync(() => editor.formatter.remove(formatName, vars));

    const sTestTableCellFormat = (formatName: string, vars: Record<string, string>, styles: Record<string, string>) =>
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
          sAssertTableCellStructure(styles, { cell1: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on single cell selection (cell)', [
          tinyApis.sSetContent(beforeTable({ cell1: true })),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (row)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true })),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true, cell2: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (col)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell3: true })),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true, cell3: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (table)', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true })),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true, cell2: true, cell3: true, cell4: true })
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on single cell with cursor in it then remove format', [
          tinyApis.sSetContent(beforeTable()),
          tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true }),
          sRemoveFormat(editor, formatName, vars),
          sAssertTableCellStructure()
        ]),
        Log.stepsAsStep('TINY-6004', 'Apply format on multi cell selection (table) then remove format', [
          tinyApis.sSetContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true })),
          sApplyFormat(editor, formatName, vars),
          sAssertTableCellStructure(styles, { cell1: true, cell2: true, cell3: true, cell4: true }),
          sRemoveFormat(editor, formatName, vars),
          sAssertTableCellStructure()
        ])
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestTableCellFormat('tablecellbackgroundcolor', { value: 'red' }, { 'background-color': 'red' }),
      sTestTableCellFormat('tablecellbordercolor', { value: 'red' }, { 'border-color': 'red' }),
      sTestTableCellFormat('tablecellborderstyle', { value: 'dashed' }, { 'border-style': 'dashed' }),
      sTestTableCellFormat('tablecellborderwidth', { value: '5px' }, { 'border-width': '5px' })
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

