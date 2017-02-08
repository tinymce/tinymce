asynctest(
  'browser.tinymce.plugins.table.ClipboardTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.plugins.table.Plugin',
    'ephox.mcagar.api.TinyLoader',
    'global!tinymce.util.Tools'
  ],
  function (Pipeline, LegacyUnit, Plugin, TinyLoader, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();


    var cleanTableHtml = function (html) {
      return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
    };

    suite.test("mceTablePasteRowBefore command", function (editor) {
      editor.setContent(
        '<table>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '<tr><td>2</td><td>3</td></tr>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');
      LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
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

      LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
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

    suite.test("mceTablePasteRowAfter command", function (editor) {
      editor.setContent(
        '<table>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '<tr><td>2</td><td>3</td></tr>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');
      LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
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

      LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
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

    suite.test("mceTablePasteRowAfter from merged row source", function (editor) {
      editor.setContent(
        '<table>' +
        '<tbody>' +
        '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '</tbody>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');
      LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
      editor.execCommand('mceTablePasteRowAfter');

      LegacyUnit.equal(
        cleanTableHtml(editor.getContent()),

        '<table>' +
        '<tbody>' +
        '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '<tr><td>1 2</td><td>3</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>'
      );
    });

    suite.test("mceTablePasteRowAfter from merged row source to merged row target", function (editor) {
      editor.setContent(
        '<table>' +
        '<tbody>' +
        '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '</tbody>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');
      LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
      editor.execCommand('mceTablePasteRowAfter');

      LegacyUnit.equal(
        cleanTableHtml(editor.getContent()),

        '<table>' +
        '<tbody>' +
        '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
        '<tr><td>1 2</td><td>3</td><td>&nbsp;</td></tr>' +
        '<tr><td>1</td><td>2</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>'
      );
    });

    suite.test("mceTablePasteRowAfter to wider table", function (editor) {
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

      LegacyUnit.setSelection(editor, 'table:nth-child(1) tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');

      LegacyUnit.setSelection(editor, 'table:nth-child(2) td', 0);
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

    suite.test("mceTablePasteRowAfter to narrower table", function (editor) {
      editor.setContent(
        '<table>' +
        '<tbody>' +
        '<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
        '</tbody>' +
        '</table>' +

        '<table>' +
        '<tbody>' +
        '<tr><td>1b</td><td>2b</td></tr>' +
        '</tbody>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'table:nth-child(1) tr:nth-child(1) td', 0);
      editor.execCommand('mceTableCopyRow');

      LegacyUnit.setSelection(editor, 'table:nth-child(2) td', 0);
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
        '<tr><td>1b</td><td>2b</td></tr>' +
        '<tr><td>1a</td><td>2a</td></tr>' +
        '</tbody>' +
        '</table>'
      );
    });

    suite.test("row clipboard api", function (editor) {
      var clipboardRows;

      function createRow(cellContents) {
        var tr = editor.dom.create('tr');

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
      }
    }, success, failure);
  }
);
