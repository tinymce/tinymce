import { Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableRowDialogTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const generalSelectors = {
    type: 'label.tox-label:contains(Row type) + div.tox-selectfield>select',
    align: 'label.tox-label:contains(Alignment) + div.tox-selectfield>select',
    height: 'label.tox-label:contains(Height) + input.tox-textfield'
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const baseHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><tr><td>X</td></tr></table>';

    const baseData = {
      height: '',
      align: '',
      type: 'tbody',
    };

    const advHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><thead>' +
      '<tr style="height: 10px; text-align: right; border-color: red; background-color: blue"><td>X</td></tr>' +
      '</thead></table>';

    const advData = {
      align: 'right',
      height: '10px',
      type: 'thead',
      backgroundcolor: 'blue',
      bordercolor: 'red',
      borderstyle: '',
    };

    const baseGetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table row properties dialog (get data from plain cell)', [
        tinyApis.sSetSetting('table_row_advtab', false),
        UiFinder.sWaitForVisible('waiting for editor', Element.fromDom(document.body), 'div.tox-tinymce'),
        tinyApis.sSetContent(baseHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(baseData, false, generalSelectors),
        TableTestUtils.sClickDialogButton('cancel dialog', false)
      ]);
    };

    const baseGetSetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table row properties dialog (update all)', [
        UiFinder.sWaitForVisible('waiting for editor', Element.fromDom(document.body), 'div.tox-tinymce'),
        tinyApis.sSetContent(baseHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sSetDialogValues({
          height: '10',
          align: 'right',
          type: 'thead'
        }, false, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent('<table style="border: 1px solid black; border-collapse: collapse;" border="1"><thead><tr style="height: 10px; text-align: right;"><td>X</td></tr></thead></table>')
      ]);
    };

    const captionTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Caption should always stay the firstChild of the table (see TINY-1167)', [
        tinyApis.sSetContent('<table><caption>CAPTION</caption><tbody><tr><td>X</td></tr><tr><td>Y</td></tr></tbody></table>'),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,

        TableTestUtils.sSetDialogValues({
          height: '',
          align: '',
          type: 'thead'
        }, false, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent('<table><caption>CAPTION</caption><thead><tr><td>X</td></tr></thead><tbody><tr><td>Y</td></tr></tbody></table>')
      ]);
    };

    const advGetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Table row properties dialog (get data from complex row)', [
        tinyApis.sSetSetting('table_row_advtab', true),
        tinyApis.sSetContent(advHtml),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking cancel', false)
      ]);
    };

    const advGetSetTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Update advanced styles from row properties dialog', [
        UiFinder.sWaitForVisible('waiting for editor', Element.fromDom(document.body), 'div.tox-tinymce'),
        tinyApis.sSetContent(
          '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
          '<tbody>' +
          '<tr>' +
          '<td>a</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        tinyApis.sSelect('td', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sSetDialogValues({
          align: '',
          height: '',
          type: 'tbody',
          bordercolor: 'blue',
          borderstyle: 'dotted',
          backgroundcolor: '#ff0000'
        }, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent(
          '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
          '<tbody>' +
          '<tr style="border-color: blue; border-style: dotted; background-color: #ff0000;">' +
          '<td>a</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      ]);
    };

    const advRemoveTest = () => {
      return Log.stepsAsStep('TBA', 'Table: Remove all advanced styles through the style field', [
        tinyApis.sSetContent(advHtml),

        tinyApis.sSelect('tr:nth-child(1) td:nth-child(1)', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
        TableTestUtils.sSetDialogValues({
          align: '',
          height: '',
          type: 'tbody',
          backgroundcolor: '',
          bordercolor: '',
          borderstyle: '',
        }, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent(
          '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
          '<tbody>' +
          '<tr>' +
          '<td>X</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      ]);
    };

    const multiUpdateTest = () => {
      const initialHtml =
        '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
        '<tbody>' +
        '<tr style="height: 20px; border-color: blue;">' +
        '<td data-mce-selected="1">a</td>' +
        '<td data-mce-selected="1">b</td>' +
        '</tr>' +
        '<tr style="height: 20px; border-color: blue;">' +
        '<td data-mce-selected="1">c</td>' +
        '<td data-mce-selected="1">d</td>' +
        '</tr>' +
        '</tbody></table>';

      const initialData = {
        align: '',
        height: '20px',
        type: 'tbody',
        backgroundcolor: '',
        bordercolor: 'blue',
        borderstyle: '',
      };

      const newData = {
        align: 'center',
        height: '',
        type: 'tbody',
        backgroundcolor: '',
        bordercolor: 'red',
        borderstyle: '',
      };

      const newHtml =
        '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
        '<tbody>' +
        '<tr style="height: 20px; text-align: center; border-color: red;">' +
        '<td>a</td>' +
        '<td>b</td>' +
        '</tr>' +
        '<tr style="height: 20px; text-align: center; border-color: red;">' +
        '<td>c</td>' +
        '<td>d</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>';

      return Log.stepsAsStep('TBA', 'Table: Table row properties dialog update multiple rows', [
        tinyApis.sSetContent(initialHtml),
        tinyApis.sSelect('tr:nth-child(2) td:nth-child(2)', [0]),
        TableTestUtils.sOpenTableDialog,
        TableTestUtils.sAssertDialogValues(initialData, true, generalSelectors),
        TableTestUtils.sSetDialogValues(newData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent(newHtml),
      ]);
    };

    Pipeline.async({}, [
      tinyApis.sFocus,
      baseGetTest(),
      baseGetSetTest(),
      captionTest(),
      advGetTest(),
      advGetSetTest(),
      advRemoveTest(),
      multiUpdateTest()
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'tablerowprops',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,border-style,background-color,border,padding,border-spacing,border-collapse'
    },
  }, success, failure);
});