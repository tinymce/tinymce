import { Assertions, Log, Pipeline, UiFinder, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableRowDialogTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const generalSelectors = {
    type: 'label.tox-label:contains(Row type) + div.tox-listboxfield > .tox-listbox',
    align: 'label.tox-label:contains(Alignment) + div.tox-listboxfield > .tox-listbox',
    height: 'label.tox-label:contains(Height) + input.tox-textfield'
  };

  let events = [];
  const logEvent = (event: EditorEvent<{}>) => {
    events.push(event);
  };

  const sClearEvents = Step.sync(() => events = []);

  const defaultEvents = [{ type: 'tablemodified', structure: false, style: true }];
  const sAssertEvents = (expectedEvents: {type: string; structure: boolean; style: boolean}[] = defaultEvents) => Step.sync(() => {
    if (events.length > 0) {
      Arr.each(events, (event) => {
        const tableElm = SugarElement.fromDom(event.table);
        Assertions.assertEq('Expected events should have been fired', true, SugarNode.isTag('table')(tableElm));
      });
    }
    Assertions.assertEq('Expected events should have been fired', expectedEvents, Arr.map(events, (event) => ({
      type: event.type,
      structure: event.structure,
      style: event.style,
    })));
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const baseHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><tr><td>X</td></tr></table>';

    const baseData = {
      height: '',
      align: '',
      type: 'body'
    };

    const advHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><thead>' +
      '<tr style="height: 10px; text-align: right; border-color: red; background-color: blue"><td>X</td></tr>' +
      '</thead></table>';

    const advData = {
      align: 'right',
      height: '10px',
      type: 'header',
      backgroundcolor: 'blue',
      bordercolor: 'red',
      borderstyle: ''
    };

    const baseGetTest = () => Log.stepsAsStep('TBA', 'Table: Table row properties dialog (get data from plain cell)', [
      sAssertEvents([]),
      tinyApis.sSetSetting('table_row_advtab', false),
      UiFinder.sWaitForVisible('waiting for editor', SugarElement.fromDom(document.body), 'div.tox-tinymce'),
      tinyApis.sSetContent(baseHtml),
      tinyApis.sSelect('td', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),
      TableTestUtils.sAssertDialogValues(baseData, false, generalSelectors),
      TableTestUtils.sClickDialogButton('cancel dialog', false),
      sAssertEvents([])
    ]);

    const baseGetSetTest = () => Log.stepsAsStep('TBA', 'Table: Table row properties dialog (update all)', [
      sAssertEvents([]),
      UiFinder.sWaitForVisible('waiting for editor', SugarElement.fromDom(document.body), 'div.tox-tinymce'),
      tinyApis.sSetContent(baseHtml),
      tinyApis.sSelect('td', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),
      TableTestUtils.sSetDialogValues({
        height: '10',
        align: 'right',
        type: 'header'
      }, false, generalSelectors),
      TableTestUtils.sClickDialogButton('clicking save', true),
      tinyApis.sAssertContent('<table style="border: 1px solid black; border-collapse: collapse;" border="1"><thead><tr style="height: 10px; text-align: right;"><td scope="col">X</td></tr></thead></table>'),
      sAssertEvents([{ type: 'tablemodified', structure: true, style: true }]),
      sClearEvents
    ]);

    const captionTest = () => Log.stepsAsStep('TBA', 'Table: Caption should always stay the firstChild of the table (see TINY-1167)', [
      sAssertEvents([]),
      tinyApis.sSetContent('<table><caption>CAPTION</caption><tbody><tr><td>X</td></tr><tr><td>Y</td></tr></tbody></table>'),
      tinyApis.sSelect('td', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),

      TableTestUtils.sSetDialogValues({
        height: '',
        align: '',
        type: 'header'
      }, false, generalSelectors),
      TableTestUtils.sClickDialogButton('clicking save', true),
      tinyApis.sAssertContent('<table><caption>CAPTION</caption><thead><tr><td scope="col">X</td></tr></thead><tbody><tr><td>Y</td></tr></tbody></table>'),
      sAssertEvents([{ type: 'tablemodified', structure: true, style: false }]),
      sClearEvents
    ]);

    const advGetTest = () => Log.stepsAsStep('TBA', 'Table: Table row properties dialog (get data from complex row)', [
      tinyApis.sSetSetting('table_row_advtab', true),
      tinyApis.sSetContent(advHtml),
      tinyApis.sSelect('td', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),
      TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
      TableTestUtils.sClickDialogButton('clicking cancel', false),
      sAssertEvents([])
    ]);

    const advGetSetTest = () => Log.stepsAsStep('TBA', 'Table: Update advanced styles from row properties dialog', [
      sAssertEvents([]),
      UiFinder.sWaitForVisible('waiting for editor', SugarElement.fromDom(document.body), 'div.tox-tinymce'),
      tinyApis.sSetContent(
        '<table style="border: 1px solid black; border-collapse: collapse;" border="1">' +
          '<tbody>' +
          '<tr>' +
          '<td>a</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
      ),
      tinyApis.sSelect('td', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),
      TableTestUtils.sSetDialogValues({
        align: '',
        height: '',
        type: 'body',
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
      ),
      sAssertEvents(),
      sClearEvents
    ]);

    const advRemoveTest = () => Log.stepsAsStep('TBA', 'Table: Remove all advanced styles through the style field', [
      sAssertEvents([]),
      tinyApis.sSetContent(advHtml),

      tinyApis.sSelect('tr:nth-child(1) td:nth-child(1)', [ 0 ]),
      TableTestUtils.sOpenTableDialog(tinyUi),
      TableTestUtils.sAssertDialogValues(advData, true, generalSelectors),
      TableTestUtils.sSetDialogValues({
        align: '',
        height: '',
        type: 'body',
        backgroundcolor: '',
        bordercolor: '',
        borderstyle: ''
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
      ),
      sAssertEvents([{ type: 'tablemodified', structure: true, style: true }]),
      sClearEvents
    ]);

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
        type: 'body',
        backgroundcolor: '',
        bordercolor: 'blue',
        borderstyle: ''
      };

      const newData = {
        align: 'center',
        height: '',
        type: 'body',
        backgroundcolor: '',
        bordercolor: 'red',
        borderstyle: ''
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
        sAssertEvents([]),
        tinyApis.sSetContent(initialHtml),
        tinyApis.sSelect('tr:nth-child(2) td:nth-child(2)', [ 0 ]),
        TableTestUtils.sOpenTableDialog(tinyUi),
        TableTestUtils.sAssertDialogValues(initialData, true, generalSelectors),
        TableTestUtils.sSetDialogValues(newData, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent(newHtml),
        sAssertEvents(),
        sClearEvents
      ]);
    };

    const changeHeaderToBodyTest = () => {
      const initialHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><thead><tr><td>X</td></tr></thead><tbody><tr><td>Y</td></tr></tbody></table>';
      const expectedHtml = '<table style="border: 1px solid black; border-collapse: collapse;" border="1"><tbody><tr><td>X</td></tr><tr><td>Y</td></tr></tbody></table>';

      const initialData = {
        align: '',
        height: '',
        type: 'header',
        backgroundcolor: '',
        bordercolor: '',
        borderstyle: ''
      };

      return Log.stepsAsStep('TBA', 'Table: Change table row type from header to body', [
        sAssertEvents([]),
        tinyApis.sSetContent(initialHtml),

        tinyApis.sSelect('tr:nth-child(1) td:nth-child(1)', [ 0 ]),
        TableTestUtils.sOpenTableDialog(tinyUi),
        TableTestUtils.sAssertDialogValues(initialData, true, generalSelectors),
        TableTestUtils.sSetDialogValues({
          align: '',
          height: '',
          type: 'body',
          backgroundcolor: '',
          bordercolor: '',
          borderstyle: ''
        }, true, generalSelectors),
        TableTestUtils.sClickDialogButton('clicking save', true),
        tinyApis.sAssertContent(expectedHtml),
        sAssertEvents([{ type: 'tablemodified', structure: true, style: false }]),
        sClearEvents
      ]);
    };

    Pipeline.async({}, [
      tinyApis.sFocus(),
      baseGetTest(),
      baseGetSetTest(),
      captionTest(),
      advGetTest(),
      advGetSetTest(),
      advRemoveTest(),
      multiUpdateTest(),
      changeHeaderToBodyTest()
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
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, success, failure);
});
