import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.GridSelectionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  const assertTableSelection = function (editor, tableHtml, selectCells, cellContents) {
    function selectRangeXY(table, startTd, endTd) {
      editor.fire('mousedown', { target: startTd, button: 0 });
      editor.fire('mouseover', { target: endTd, button: 0 });
      editor.fire('mouseup', { target: endTd, button: 0 });
    }

    function getCells(table) {
      return editor.$(table).find('td').toArray();
    }

    function getSelectedCells(table) {
      return editor.$(table).find('td[data-mce-selected]').toArray();
    }

    editor.setContent(tableHtml);

    const table = editor.$('table')[0];
    const cells = getCells(table);

    const startTd = Tools.grep(cells, function (elm) {
      return elm.innerHTML === selectCells[0];
    })[0];

    const endTd = Tools.grep(cells, function (elm) {
      return elm.innerHTML === selectCells[1];
    })[0];

    selectRangeXY(table, startTd, endTd);

    let selection = getSelectedCells(table);
    selection = Tools.map(selection, function (elm) {
      return elm.innerHTML;
    });

    LegacyUnit.deepEqual(selection, cellContents);
  };

  suite.test('Table grid selection', function (editor) {
    assertTableSelection(editor, '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '2'], ['1', '2']);
    assertTableSelection(editor, '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '3'], ['1', '3']);
    assertTableSelection(editor,
      '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>', ['1', '4'], ['1', '2', '3', '4']);
    assertTableSelection(editor,
      '<table><tr><td colspan="2" rowspan="2">1</td><td>3</td></tr><tr><td>6</td></tr></table>', ['1', '6'], ['1', '3', '6']);
    assertTableSelection(editor,
      '<table>' +
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
      ['2', '6'],
      ['2', '3', '4', '5', '6']
    );
  });

  const sSetRawContent = function (editor, html) {
    return Step.sync(function () {
      editor.getBody().innerHTML = html;
    });
  };

  const sAssertSelectionContent = function (editor, expectedHtml) {
    return Step.sync(function () {
      Assertions.assertHtml('Should be expected content', expectedHtml, editor.selection.getContent());
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor).concat([
      Logger.t('Extracted selection contents should be without internal attributes', GeneralSteps.sequence([
        sSetRawContent(editor, '<table><tr><td data-mce-selected="1">a</td><td>b</td></tr><tr><td data-mce-selected="1">c</td><td>d</td></tr></table>'),
        sAssertSelectionContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>c</td></tr></tbody></table>')
      ]))
    ]), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
