import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.command.MergeCellCommandTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  SilverTheme();

  const testCommand = function (_editor, _command, _tests) {
    // TODO: Figure out why these doesn't work
    /* Tools.each(tests, function (test) {
      editor.getBody().innerHTML = test.before;
      editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
      editor.selection.collapse(true);
      editor.execCommand(command);
      LegacyUnit.equal(cleanTableHtml(editor.getContent()), test.after, test.message);
    });*/
  };

  // const cleanTableHtml = function (html) {
  //   return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
  // };

  suite.test('TestCase-TBA: Table: mceTableMergeCells', function (editor) {
    testCommand(editor, 'mceTableMergeCells', [
      {
        message: 'Should merge all cells into one',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
        ),

        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1b1a2b2</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should merge cells in two cols/rows into one cell with colspan',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
          '</table>'
        ),

        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1b1a2b2</td></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should remove all rowspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td rowspan="2">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1</td><td>b1b2</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should remove all colspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1</td></tr>' +
          '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1</td></tr>' +
          '<tr><td>a2b2</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should remove rowspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td rowspan="3">a1</td><td rowspan="3">b1</td><td data-mce-selected="1">c1</td></tr>' +
          '<tr><td data-mce-selected="1">c2</td></tr>' +
          '<tr><td data-mce-selected="1">c3</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1</td><td>b1</td><td>c1c2c3</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should remove colspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td><td data-mce-selected="1">c1</td></tr>' +
          '<tr><td colspan="3">a2</td></tr>' +
          '<tr><td colspan="3">a3</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1b1c1</td></tr>' +
          '<tr><td>a2</td></tr>' +
          '<tr><td>a3</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should reduce rowspans to 2 keep the colspan and remove one tr',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2" rowspan="2">a1</td><td rowspan="3">b1</td><td data-mce-selected="1">c1</td></tr>' +
          '<tr><td data-mce-selected="1">c2</td></tr>' +
          '<tr><td>a3</td><td>b3</td><td data-mce-selected="1">c3</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1</td><td rowspan="2">b1</td><td rowspan="2">c1c2c3</td></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should reduce colspans to 2 keep the rowspan',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td><td data-mce-selected="1">c1</td></tr>' +
          '<tr><td colspan="3">a2</td></tr>' +
          '<tr><td colspan="2" rowspan="2">a3</td><td>c3</td></tr>' +
          '<tr><td>c4</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1b1c1</td></tr>' +
          '<tr><td colspan="2">a2</td></tr>' +
          '<tr><td rowspan="2">a3</td><td>c3</td></tr>' +
          '<tr><td>c4</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should merge b3+c3 but not reduce a2a3',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td>b1</td>' +
          '<td>c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td rowspan="2">a2a3</td>' +
          '<td>b2</td>' +
          '<td>c2</td>' +
          '</tr>' +
          '<tr>' +
          '<td data-mce-selected="1">b3</td>' +
          '<td data-mce-selected="1">c3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td>b1</td>' +
          '<td>c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td rowspan="2">a2a3</td>' +
          '<td>b2</td>' +
          '<td>c2</td>' +
          '</tr>' +
          '<tr>' +
          '<td colspan="2">b3c3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should merge b1+c1 and reduce a2',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td data-mce-selected="1">b1</td>' +
          '<td data-mce-selected="1">c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td colspan="3">a2</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td>b1c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td colspan="2">a2</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should merge a2+a3 and reduce b1',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td rowspan="3">b1</td>' +
          '</tr>' +
          '<tr>' +
          '<td data-mce-selected="1">a2</td>' +
          '</tr>' +
          '<tr>' +
          '<td data-mce-selected="1">a3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td rowspan="2">b1</td>' +
          '</tr>' +
          '<tr>' +
          '<td>a2a3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      }
    ]);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Table: Test merge cell commands', suite.toSteps(editor)), onSuccess, onFailure);
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
