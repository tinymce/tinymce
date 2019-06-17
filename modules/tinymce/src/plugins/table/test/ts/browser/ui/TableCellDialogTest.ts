import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableCellDialogTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const generalSelectors = {
    width: 'label.tox-label:contains(Width) + input.tox-textfield',
    height: 'label.tox-label:contains(Height) + input.tox-textfield',
    celltype: 'label.tox-label:contains(Cell type) + div.tox-selectfield>select',
    scope: 'label.tox-label:contains(Scope) + div.tox-selectfield>select',
    halign: 'label.tox-label:contains(H Align) + div.tox-selectfield>select',
    valign: 'label.tox-label:contains(V Align) + div.tox-selectfield>select'
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const baseHtml = '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td data-mce-selected="1">a</td>' +
      '<td>b</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>';

    // tinyApis.sAssertContent uses editor.getContent() which strips out data-mce-selected
    const noSelectBaseHtml = '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>';

    const baseData = {
      width: '',
      height: '',
      celltype: 'td',
      halign: '',
      valign: '',
      scope: '',
    };

    const baseAdvData = {
      width: '',
      height: '',
      celltype: 'td',
      halign: '',
      valign: '',
      scope: '',
      backgroundcolor: '',
      bordercolor: '',
      borderstyle: ''
    };

    const baseGetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table cell properties dialog (get data from basic cell)', [
        tinyApis.sSetSetting('table_cell_advtab', false),
        tinyApis.sSetContent(baseHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseData, false, generalSelectors),
        TableTestUtils.sClickDialogButton('close dialog', false)
      ]);
    };

    const baseGetSetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table cell properties dialog (get/set data from/to basic cell)', [
        tinyApis.sSetSetting('table_cell_advtab', false),
        tinyApis.sSetContent(baseHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseData, false, generalSelectors),
        TableTestUtils.sSetDialogValues({
          width: '100',
          height: '101',
          celltype: 'td',
          scope: '',
          halign: '',
          valign: '',
        }, false, generalSelectors),
        TableTestUtils.sClickDialogButton('close dialog', true),
        tinyApis.sAssertContent('<table><tbody><tr><td style="width: 100px; height: 101px;">a</td><td>b</td></tr></tbody></table>'),
      ]);
    };

    const advGetTest = () => {
      const complexHtml = '<table><tr><th style="text-align: right; vertical-align: top; width: 10px; height: 11px; ' +
      'border-color: red; background-color: blue; border-style: dashed;" scope="row">X</th></tr></table>';

      const complexData = {
        width: '10px',
        height: '11px',
        celltype: 'th',
        scope: 'row',
        halign: 'right',
        valign: 'top',
        borderstyle: 'dashed',
        bordercolor: 'red',
        backgroundcolor: 'blue',
      };

      return Log.stepsAsStep('TBA', 'Table: Table cell properties dialog (get data from advanced cell)', [
        tinyApis.sSetSetting('table_cell_advtab', true),
        tinyApis.sSetContent(complexHtml),
        tinyApis.sSelect('th', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(complexData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('close dialog', false)
      ]);
    };

    const advGetSetTest = () => {
      const advData = {
        width: '10',
        height: '11',
        scope: 'row',
        celltype: 'th',
        halign: 'right',
        valign: 'top',
        backgroundcolor: 'blue',
        bordercolor: 'red',
        borderstyle: 'dashed',
      };

      const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
      'border-color: red; border-style: dashed; background-color: blue;" scope="row">X</th></tr></tbody></table>';

      return Log.stepsAsStep('TBA', 'Table: Table cell properties dialog (update all, including advanced)', [
        tinyApis.sSetSetting('table_cell_advtab', true),
        tinyApis.sSetContent('<table><tr><td>X</td></tr></table>'),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sSetDialogValues(advData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('submit dialog', true),
        tinyApis.sAssertContent(advHtml)
      ]);
    };

    const multiUpdate = () => {
      const initialHtml = '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td data-mce-selected="1">a</td>' +
        '<td data-mce-selected="1">b</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>';

      const newHtml = '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td style="height: 20px; vertical-align: bottom; border-style: dashed; background-color: red;">a</td>' +
              '<td style="height: 20px; vertical-align: bottom; border-style: dashed; background-color: red;">b</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>';

      const newData = {
        width: '',
        height: '20',
        celltype: 'td',
        scope: '',
        valign: 'bottom',
        halign: '',
        borderstyle: 'dashed',
        bordercolor: '',
        backgroundcolor: 'red',
      };

      return Log.stepsAsStep('TBA', 'Table: Table cell properties dialog update multiple cells', [
        tinyApis.sSetContent(initialHtml),
        tinyApis.sSelect('td:nth-child(2)', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseAdvData, true, generalSelectors),
        TableTestUtils.sSetDialogValues(newData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('submit', true),
        tinyApis.sAssertContent(newHtml),
      ]);
    };

    const removeAllTest = () => {
      const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
      'border-color: red; border-style: dashed; background-color: blue;" scope="row">X</th></tr></tbody></table>';

      const advData = {
        width: '10px',
        height: '11px',
        celltype: 'th',
        scope: 'row',
        halign: 'right',
        valign: 'top',
        backgroundcolor: 'blue',
        bordercolor: 'red',
        borderstyle: 'dashed',
      };

      const emptyTable = '<table><tbody><tr><th>X</th></tr></tbody></table>';

      const emptyData = {
        width: '',
        height: '',
        scope: '',
        celltype: 'th', // is never empty
        halign: '',
        valign: '',
        backgroundcolor: '',
        bordercolor: '',
        borderstyle: '',
      };

      return Log.stepsAsStep('TBA', 'Table: Remove all styles', [
        tinyApis.sSetContent(advHtml),
        tinyApis.sSelect('th', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
        TableTestUtils.sSetDialogValues(emptyData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('submit dialog', true),
        tinyApis.sAssertContent(emptyTable)
      ]);
    };

    const execCommandTest = () => {
      const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
      'border-color: red; border-style: dashed; background-color: blue;" scope="row">X</th></tr></tbody></table>';

      const advData = {
        width: '10px',
        height: '11px',
        celltype: 'th',
        scope: 'row',
        halign: 'right',
        valign: 'top',
        backgroundcolor: 'blue',
        bordercolor: 'red',
        borderstyle: 'dashed',
      };

      return Log.stepsAsStep('TBA', 'Table: Open dialog via execCommand', [
        tinyApis.sSetContent(advHtml),
        tinyApis.sSelect('th', [0]),
        tinyApis.sExecCommand('mceTableCellProps'),
        TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('submit dialog', false),
      ]);
    };

    const okCancelTest = () => {
      const advData = {
        width: '10px',
        height: '11px',
        scope: 'row',
        celltype: 'th',
        halign: 'right',
        valign: 'top',
        borderstyle: 'dashed',
        bordercolor: 'red',
        backgroundcolor: 'blue',
      };

      const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
      'border-color: red; border-style: dashed; background-color: blue;" scope="row">a</th><td>b</td></tr></tbody></table>';

      return Log.stepsAsStep('TBA', 'Table: Test cancel changes nothing and save does', [
        tinyApis.sSetSetting('table_cell_advtab', true),
        tinyApis.sSetContent(baseHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseAdvData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('click cancel', false),
        tinyApis.sAssertContent(noSelectBaseHtml),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseAdvData, true, generalSelectors),
        TableTestUtils.sSetDialogValues(advData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('submit dialog', true),
        tinyApis.sAssertContent(advHtml),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
      ]);
    };

    Pipeline.async({}, [
      tinyApis.sFocus,
      baseGetTest(),
      baseGetSetTest(),
      advGetTest(),
      advGetSetTest(),
      multiUpdate(),
      removeAllTest(),
      execCommandTest(),
      okCancelTest()
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'tablecellprops',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,border-style,background-color,border,padding,border-spacing,border-collapse'
    },
  }, success, failure);
});