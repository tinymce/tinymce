import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.ClipboardTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  const cleanTableHtml = function (html) {
    return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
  };

  const selectOne = function (editor, start) {
    start = editor.$(start)[0];

    editor.fire('mousedown', { target: start, button: 0 });
    editor.fire('mouseup', { target: start, button: 0 });

    LegacyUnit.setSelection(editor, start, 0);
  };

  const selectRangeXY = function (editor, start, end) {
    start = editor.$(start)[0];
    end = editor.$(end)[0];

    editor.fire('mousedown', { target: start, button: 0 });
    editor.fire('mouseover', { target: end, button: 0 });
    editor.fire('mouseup', { target: end, button: 0 });

    LegacyUnit.setSelection(editor, end, 0);
  };

  suite.test('mceTablePasteRowBefore command', function (editor) {
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

  suite.test('mceTablePasteRowAfter command', function (editor) {
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

  suite.test('mceTablePasteRowAfter command with thead and tfoot', function (editor) {
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

  suite.test('mceTablePasteRowAfter from merged row source', function (editor) {
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

  suite.test('mceTablePasteRowAfter from merged row source to merged row target', function (editor) {
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

  suite.test('mceTablePasteRowAfter to wider table', function (editor) {
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

  suite.test('mceTablePasteRowAfter to narrower table', function (editor) {
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

  suite.test('Copy/paste several rows with multiple rowspans', function (editor) {
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

  suite.test('row clipboard api', function (editor) {
    let clipboardRows;

    function createRow(cellContents) {
      const tr = editor.dom.create('tr');

      Tools.each(cellContents, function (html) {
        tr.appendChild(editor.dom.create('td', null, html));
      });

      return tr;
    }

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

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
