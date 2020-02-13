import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.ClipboardTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  SilverTheme();
  Plugin();

  const cleanTableHtml = (html: string) => {
    return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
  };

  const selectOne = (editor: Editor, start) => {
    start = editor.$(start)[0];

    editor.fire('mousedown', { target: start, button: 0 });
    editor.fire('mouseup', { target: start, button: 0 });

    LegacyUnit.setSelection(editor, start, 0);
  };

  const selectRangeXY = (editor, start, end) => {
    start = editor.$(start)[0];
    end = editor.$(end)[0];

    editor.fire('mousedown', { target: start, button: 0 });
    editor.fire('mouseover', { target: end, button: 0 });
    editor.fire('mouseup', { target: end, button: 0 });

    LegacyUnit.setSelection(editor, end, 0);
  };

  suite.test('selection.getContent with format equal to text', (editor) => {
    editor.focus();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td>a</td>' +
      '<td>b</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr td:nth-child(1)', 'table tr td:nth-child(2)');

    LegacyUnit.equal(
      editor.selection.getContent({ format: 'text' }), 'ab');
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowBefore command', (editor) => {
    editor.focus();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowBefore');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowBefore');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter command', (editor) => {
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter command with thead and tfoot', (editor) => {
    editor.setContent(
      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );

    selectOne(editor, 'tbody tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tbody tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );

    selectOne(editor, 'tbody tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter from merged row source', (editor) => {
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(2) td:nth-child(2)');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter from merged row source to merged row target', (editor) => {
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td><td>&nbsp;</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter to wider table', (editor) => {
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'table:nth-child(1) tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>&nbsp;</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTablePasteRowAfter to narrower table', (editor) => {
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table:nth-child(1) tr:nth-child(1) td:nth-child(1)', 'table:nth-child(1) tr:nth-child(2) td:nth-child(3)');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table:nth-child(2) tr td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: Copy/paste several rows with multiple rowspans', (editor) => {
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="3">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(1)', 'table tr:nth-child(3) td:nth-child(2)');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table tr:nth-child(4) td');
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table>' +
      '<tbody>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="3">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  suite.test('TestCase-TBA: Table: row clipboard api', (editor) => {
    let clipboardRows;

    const createRow = (cellContents) => {
      const tr = editor.dom.create('tr');

      Tools.each(cellContents, (html) => {
        tr.appendChild(editor.dom.create('td', null, html));
      });

      return tr;
    };

    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
    editor.execCommand('mceTableCopyRow');

    clipboardRows = editor.plugins.table.getClipboardRows();

    LegacyUnit.equal(clipboardRows.length, 1);
    LegacyUnit.equal(clipboardRows[0].tagName, 'TR');

    editor.plugins.table.setClipboardRows(clipboardRows.concat([
      createRow(['a', 'b']),
      createRow(['c', 'd'])
    ]));

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
    editor.execCommand('mceTablePasteRowAfter');

    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>a</td><td>b</td></tr>' +
      '<tr><td>c</td><td>d</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'Table: Test Clipboard', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
