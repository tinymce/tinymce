import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableEventData, TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableCellDialogTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'tablecellprops',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,border-style,background-color,border,padding,border-spacing,border-collapse,border-width'
    },
    setup: (editor: Editor) => {
      editor.on('tablemodified', (event) => {
        logEventTypes(event);
        logTableModified(event);
      });
      editor.on('newcell', logEventTypes);
    }
  }, [ Plugin, Theme ], true);

  const generalSelectors = {
    width: 'label.tox-label:contains(Width) + input.tox-textfield',
    height: 'label.tox-label:contains(Height) + input.tox-textfield',
    celltype: 'label.tox-label:contains(Cell type) + div.tox-listboxfield > .tox-listbox',
    scope: 'label.tox-label:contains(Scope) + div.tox-listboxfield > .tox-listbox',
    halign: 'label.tox-label:contains(Horizontal align) + div.tox-listboxfield > .tox-listbox',
    valign: 'label.tox-label:contains(Vertical align) + div.tox-listboxfield > .tox-listbox'
  };

  let events: string[] = [];
  const logEventTypes = (event: EditorEvent<{}>) => {
    events.push(event.type);
  };

  let tableModifiedEvents: Array<EditorEvent<TableModifiedEvent>> = [];
  const logTableModified = (event: EditorEvent<TableModifiedEvent>) => {
    tableModifiedEvents.push(event);
  };

  const clearEvents = () => {
    events = [];
    tableModifiedEvents = [];
  };

  const defaultEvents = [ 'tablemodified' ];
  const assertEventsOrder = (expectedEvents: string[] = defaultEvents) => {
    assert.deepEqual(events, expectedEvents, 'Expected events should have been fired in order');
  };

  const assertTableModifiedEvent = (expectedEvent: TableEventData) => {
    assert.lengthOf(tableModifiedEvents, 1, 'Should only be one table modified event');

    const event = tableModifiedEvents[0];
    const tableElm = SugarElement.fromDom(event.table);
    assert.isTrue(SugarNode.isTag('table')(tableElm), 'Should contain reference to table');
    assert.equal(event.structure, expectedEvent.structure, 'Should match expected structure');
    assert.equal(event.style, expectedEvent.style, 'Should match expected style');
  };

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
    scope: ''
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
    borderstyle: '',
    border: ''
  };

  afterEach(() => {
    clearEvents();
  });

  it('TBA: Table cell properties dialog (get data from basic cell)', async () => {
    const editor = hook.editor();
    assertEventsOrder([]);
    editor.settings.table_cell_advtab = false;
    editor.setContent(baseHtml);
    TinySelections.select(editor, 'td', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseData, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    assertEventsOrder([]);
  });

  it('TBA: Table cell properties dialog (get/set data from/to basic cell)', async () => {
    const editor = hook.editor();
    assertEventsOrder([]);
    editor.settings.table_cell_advtab = false;
    editor.setContent(baseHtml);
    TinySelections.select(editor, 'td', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseData, false, generalSelectors);
    TableTestUtils.setDialogValues({
      width: '100',
      height: '101',
      celltype: 'td',
      scope: '',
      halign: '',
      valign: ''
    }, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td style="width: 100px; height: 101px;">a</td><td>b</td></tr></tbody></table>');
    assertEventsOrder();
  });

  it('TBA: Table cell properties dialog (get data from advanced cell)', async () => {
    const complexHtml = '<table><tr><th style="text-align: right; vertical-align: top; width: 10px; height: 11px; ' +
    'border-width: 2px; border-color: red; background-color: blue; border-style: dashed;" scope="row">X</th></tr></table>';

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
      border: '2px'
    };

    const editor = hook.editor();
    editor.settings.table_cell_advtab = true;
    editor.setContent(complexHtml);
    TinySelections.select(editor, 'th', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(complexData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    assertEventsOrder([]);
  });

  it('TBA: Table cell properties dialog (update all, including advanced)', async () => {
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
      border: ''
    };

    const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
    'border-color: red; border-style: dashed; background-color: blue;" scope="row">X</th></tr></tbody></table>';

    const editor = hook.editor();
    assertEventsOrder([]);
    editor.settings.table_cell_advtab = true;
    editor.setContent('<table><tr><td>X</td></tr></table>');
    TinySelections.select(editor, 'td', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.setDialogValues(advData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, advHtml);
    assertEventsOrder([ 'newcell', 'tablemodified' ]);
    assertTableModifiedEvent({ structure: true, style: true });
  });

  it('TBA: Table cell properties dialog update multiple cells', async () => {
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
      border: ''
    };

    const editor = hook.editor();
    assertEventsOrder([]);
    editor.setContent(initialHtml);
    TinySelections.select(editor, 'td:nth-child(2)', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseAdvData, true, generalSelectors);
    TableTestUtils.setDialogValues(newData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, newHtml);
    assertEventsOrder();
  });

  it('TBA: Remove all styles', async () => {
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
      border: ''
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
      border: ''
    };

    const editor = hook.editor();
    assertEventsOrder([]);
    editor.setContent(advHtml);
    TinySelections.select(editor, 'th', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(advData, true, generalSelectors);
    TableTestUtils.setDialogValues(emptyData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, emptyTable);
    assertEventsOrder([ 'tablemodified' ]);
    assertTableModifiedEvent({ structure: false, style: true });
  });

  it('TBA: Open dialog via execCommand', async () => {
    const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
    'border-width: thick; border-color: red; border-style: dashed; background-color: blue;" scope="row">X</th></tr></tbody></table>';

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
      border: 'thick'
    };

    const editor = hook.editor();
    editor.setContent(advHtml);
    TinySelections.select(editor, 'th', [ 0 ]);
    editor.execCommand('mceTableCellProps');
    TableTestUtils.assertDialogValues(advData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    assertEventsOrder([]);
  });

  it('TBA: Test cancel changes nothing and save does', async () => {
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
      border: ''
    };

    const advHtml = '<table><tbody><tr><th style="width: 10px; height: 11px; vertical-align: top; text-align: right; ' +
    'border-color: red; border-style: dashed; background-color: blue;" scope="row">a</th><td>b</td></tr></tbody></table>';

    const editor = hook.editor();
    assertEventsOrder([]);
    editor.settings.table_cell_advtab = true;
    editor.setContent(baseHtml);
    TinySelections.select(editor, 'td', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseAdvData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    assertEventsOrder([]);
    clearEvents();
    TinyAssertions.assertContent(editor, noSelectBaseHtml);

    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(baseAdvData, true, generalSelectors);
    TableTestUtils.setDialogValues(advData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, advHtml);

    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.assertDialogValues(advData, true, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, false);
    assertEventsOrder([ 'newcell', 'tablemodified' ]);
    assertTableModifiedEvent({ structure: true, style: true });
  });

  it('TINY-6643: Changing only scope should modify neither style or structure', async () => {
    const html = (
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>1</th>' +
            '<th>2</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td data-mce-selected="1">a</td>' +
            '<td>b</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );
    const expectedhtml = (
      '<table>' +
        '<thead>' +
          '<tr>' +
            '<th>1</th>' +
            '<th>2</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td scope="row">a</td>' +
            '<td>b</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    const editor = hook.editor();
    assertEventsOrder([]);
    editor.settings.table_cell_advtab = false;
    editor.setContent(html);
    TinySelections.select(editor, 'td', [ 0 ]);
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.setDialogValues({
      width: '',
      height: '',
      celltype: 'td',
      scope: 'row',
      halign: '',
      valign: ''
    }, false, generalSelectors);
    await TableTestUtils.pClickDialogButton(editor, true);
    TinyAssertions.assertContent(editor, expectedhtml);
    assertEventsOrder([ 'tablemodified' ]);
    assertTableModifiedEvent({ structure: false, style: false });
  });
});
