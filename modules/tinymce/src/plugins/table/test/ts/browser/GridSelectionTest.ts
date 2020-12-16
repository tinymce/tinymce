import { Assertions, Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyApis, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.GridSelectionTest', (success, failure) => {

  SilverTheme();
  Plugin();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertTableSelection = (tableHtml: string, selectCells: string[], cellContents: string[]) => {
      const selectRangeXY = (table, startTd, endTd) => {
        editor.fire('mousedown', { target: startTd, button: 0 } as MouseEvent);
        editor.fire('mouseover', { target: endTd, button: 0 } as MouseEvent);
        editor.fire('mouseup', { target: endTd, button: 0 } as MouseEvent);
      };

      const getCells = (table): HTMLTableCellElement[] => editor.$(table).find('td').toArray();

      const getSelectedCells = (table) => editor.$(table).find('td[data-mce-selected]').toArray();

      return Logger.t('Assert Table Selection', Step.sync(() => {
        editor.setContent(tableHtml);

        const table = editor.$('table')[0];
        const cells = getCells(table);

        const startTd = Tools.grep(cells, (elm) => {
          return elm.innerHTML === selectCells[0];
        })[0];

        const endTd = Tools.grep(cells, (elm) => {
          return elm.innerHTML === selectCells[1];
        })[0];

        selectRangeXY(table, startTd, endTd);

        let selection = getSelectedCells(table);
        selection = Tools.map(selection, (elm) => {
          return elm.innerHTML;
        });

        LegacyUnit.deepEqual(selection, cellContents);
      }));
    };

    const assertions = [
      sAssertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', [ '1', '2' ], [ '1', '2' ]),
      sAssertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', [ '1', '3' ], [ '1', '3' ]),
      sAssertTableSelection('<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', [ '1', '4' ], [ '1', '2', '3', '4' ]),
      sAssertTableSelection('<table><tr><td colspan="2" rowspan="2">1</td><td>3</td></tr><tr><td>6</td></tr></table>', [ '1', '6' ], [ '1', '3', '6' ]),
      sAssertTableSelection('<table>' +
        '<tr>' +
        '<td>1</td>' +
        '<td>2</td>' +
        '<td>3</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2" rowspan="2">4</td>' +
        '<td>5</td>' +
        '</tr>' +
        '<tr>' +
        '<td>6</td>' +
        '</tr>' +
        '</table>',
      [ '2', '6' ],
      [ '2', '3', '4', '5', '6' ]
      )
    ];

    const sAssertSelectionContent = (editor, expectedHtml: string) => {
      return Step.sync(() => {
        Assertions.assertHtml('Should be expected content', expectedHtml, editor.selection.getContent());
      });
    };

    Pipeline.async({}, assertions.concat(Log.steps('TBA', 'Table: Extracted selection contents should be without internal attributes', [
      tinyApis.sSetRawContent('<table><tr><td data-mce-selected="1">a</td><td>b</td></tr><tr><td data-mce-selected="1">c</td><td>d</td></tr></table>'),
      sAssertSelectionContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>c</td></tr></tbody></table>')
    ])
    ), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
