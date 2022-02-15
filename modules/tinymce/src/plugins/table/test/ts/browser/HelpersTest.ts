import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import * as Helpers from 'tinymce/plugins/table/ui/Helpers';

describe('browser.tinymce.plugins.table.HelpersTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: extractDataFromCellElement 1', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<tbody><tr>' +
      '<td width="20" height="30" scope="row" class="foo" ' +
      'style="background-color: #333333; text-align:left; ' +
      'vertical-align:middle; border-style: dashed; ' +
      'border-color: #D91111">a</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    const td = UiFinder.findIn<HTMLTableCellElement>(TinyDom.body(editor), 'td.foo').getOrDie();
    const cellData = Helpers.extractDataFromCellElement(editor, td.dom, true, Optional.none());
    assert.equal(cellData.class, 'foo', 'Extracts class');
    assert.equal(cellData.scope, 'row', 'Extracts scope');
    assert.equal(cellData.celltype, 'td', 'Extracts celltype');
    assert.equal(cellData.halign, 'left', 'Extracts halign');
    assert.equal(cellData.valign, 'middle', 'Extracts valign');
    assert.equal(cellData.width, '20', 'Extracts width');
    assert.equal(cellData.height, '30', 'Extracts height');

    assert.equal(cellData.backgroundcolor, '#333333', 'Extracts background-color');
    assert.equal(cellData.bordercolor, '#D91111', 'Extracts border-color');
    assert.equal(cellData.borderstyle, 'dashed', 'Extracts border-style');
  });

  it('TBA: extractDataFromCellElement 1 with colgroup', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<colgroup>' +
      '<col width="20" class="foo">' +
      '</colgroup>' +
      '<tbody>' +
      '<tr>' +
      '<td height="30" scope="row" class="foo" style="background-color: #333333; text-align:left; vertical-align:middle; border-style: dashed; border-color: #D91111">a</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );
    const elements = UiFinder.findAllIn(TinyDom.body(editor), '.foo') as [ SugarElement<HTMLTableColElement>, SugarElement<HTMLTableCellElement> ];
    const cellData = Helpers.extractDataFromCellElement(editor, elements[1].dom, true, Optional.some(elements[0].dom));
    assert.equal(cellData.class, 'foo', 'Extracts class');
    assert.equal(cellData.scope, 'row', 'Extracts scope');
    assert.equal(cellData.celltype, 'td', 'Extracts celltype');
    assert.equal(cellData.halign, 'left', 'Extracts halign');
    assert.equal(cellData.valign, 'middle', 'Extracts valign');
    assert.equal(cellData.width, '20', 'Does Not Extracts width');
    assert.equal(cellData.height, '30', 'Extracts height');

    assert.equal(cellData.backgroundcolor, '#333333', 'Extracts background-color');
    assert.equal(cellData.bordercolor, '#D91111', 'Extracts border-color');
    assert.equal(cellData.borderstyle, 'dashed', 'Extracts border-style');
  });

  it('TBA: extractDataFromCellElement 2', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<tbody><tr>' +
      '<td class="foo" style="width: 20px; height: 30px; ' +
      'background-color: rgb(51,51,51); border-color: rgb(217, 17, 17);" ' +
      'data-mce-selected="1">a</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    const td = UiFinder.findIn<HTMLTableCellElement>(TinyDom.body(editor), 'td.foo').getOrDie();
    const cellData = Helpers.extractDataFromCellElement(editor, td.dom, true, Optional.none());
    assert.equal(cellData.width, '20px', 'Extracts width from style');
    assert.equal(cellData.height, '30px', 'Extracts height from style');
    assert.equal(cellData.backgroundcolor, '#333333', 'Extracts background-color from rgb');
    assert.equal(cellData.bordercolor, '#D91111', 'Extracts border-color from rgb');
  });

  it('TBA: extractDataFromCellElement 2 with colgroup', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<colgroup>' +
      '<col style="width: 20px;" class="foo">' +
      '</colgroup>' +
      '<tbody>' +
      '<tr>' +
      '<td class="foo" style="height: 30px; background-color: rgb(51,51,51); border-color: rgb(217, 17, 17);" data-mce-selected="1">a</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );
    const elements = UiFinder.findAllIn(TinyDom.body(editor), '.foo') as [ SugarElement<HTMLTableColElement>, SugarElement<HTMLTableCellElement> ];
    const cellData = Helpers.extractDataFromCellElement(editor, elements[1].dom, true, Optional.some(elements[0].dom));
    assert.equal(cellData.width, '20px', 'Extracts width from style');
    assert.equal(cellData.height, '30px', 'Extracts height from style');
    assert.equal(cellData.backgroundcolor, '#333333', 'Extracts background-color from rgb');
    assert.equal(cellData.bordercolor, '#D91111', 'Extracts border-color from rgb');
  });

  it('TBA: extractDataFromCellElement 3', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<tbody><tr>' +
      '<td class="foo" style="width: 20px; height: 30px; ' +
      'border: medium dashed #008000;" data-mce-selected="1">a</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    const td = UiFinder.findIn<HTMLTableCellElement>(TinyDom.body(editor), 'td.foo').getOrDie();
    const cellData = Helpers.extractDataFromCellElement(editor, td.dom, true, Optional.none());
    assert.equal(cellData.bordercolor, '#008000', 'Extracts border-color from shorthand');
    assert.equal(cellData.borderstyle, 'dashed', 'Extracts border-style from shorthand');
  });

  it('TBA: extractDataFromCellElement 3 with colgroup', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1">' +
      '<colgroup>' +
      '<col style="width: 20px;" class="foo">' +
      '</colgroup>' +
      '<tbody>' +
      '<tr>' +
      '<td class="foo" style="height: 30px; border: medium dashed #008000;" data-mce-selected="1">a</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );
    const elements = UiFinder.findAllIn(TinyDom.body(editor), '.foo') as [ SugarElement<HTMLTableColElement>, SugarElement<HTMLTableCellElement> ];
    const cellData = Helpers.extractDataFromCellElement(editor, elements[1].dom, true, Optional.some(elements[0].dom));
    assert.equal(cellData.bordercolor, '#008000', 'Extracts border-color from shorthand');
    assert.equal(cellData.borderstyle, 'dashed', 'Extracts border-style from shorthand');
  });

  it('TBA: extractDataFromRowElement', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse;" border="1"><tbody>' +
      '<tr class="foo" style="height:30px; ' +
      'background-color: #333333; text-align:left; vertical-align:middle; ' +
      'border-style: dashed; border-color: #d91111"><td>a</td></tr>' +
      '</tbody></table>'
    );
    const tr = UiFinder.findIn<HTMLTableRowElement>(TinyDom.body(editor), 'tr.foo').getOrDie();
    const rowData = Helpers.extractDataFromRowElement(editor, tr.dom, true);
    assert.equal(rowData.height, '30px', 'Extracts height');
    assert.equal(rowData.class, 'foo', 'Extracts class');
    assert.equal(rowData.align, 'left', 'Extracts align');
    assert.equal(rowData.type, 'body', 'Extracts type');
    assert.equal(rowData.borderstyle, 'dashed', 'Extracts border-style');
    assert.equal(rowData.bordercolor, '#D91111', 'Extracts border-color');
    assert.equal(rowData.backgroundcolor, '#333333', 'Extracts background-color');
  });

  it('TBA: extractDataFromTableElement 1', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" cellspacing="1" cellpadding="2" ' +
      'style="margin-left: auto; margin-right: auto; width: 20px; height:30px;">' +
      '<caption>A caption</caption><tbody><tr><td>a</td></tr></tbody>' +
      '</table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.class, 'foo mce-item-table', 'Extracts class');
    assert.equal(tableData.width, '20px', 'Extracts width');
    assert.equal(tableData.height, '30px', 'Extracts height');
    assert.equal(tableData.cellspacing, '1', 'Extracts cellspacing');
    assert.equal(tableData.cellpadding, '2', 'Extracts cellpadding');
    assert.equal(tableData.caption, true, 'Extracts caption');
    assert.equal(tableData.align, 'center', 'Extracts align');
  });

  it('TBA: extractDataFromTableElement 2 - right alignment', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" style="margin-left: auto; margin-right: 0px"><tbody><tr><td style="padding: 99px;">a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.cellpadding, '99px', 'Extracts cellpadding from td');
    assert.equal(tableData.align, 'right', 'Extracts align');
  });

  it('TBA: extractDataFromTableElement 2 - left alignment', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" style="margin-left: 0px; margin-right: auto;"><tbody><tr><td style="padding: 99px;">a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.align, 'left', 'Extracts align');
  });

  it('TBA: extractDataFromTableElement 3 - border width from border-width style', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" style="border-width: 5px" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.border, '5px', 'Extracts border-width');
  });

  it('TBA: extractDataFromTableElement 4 - border width from border style', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" style="border: 5px solid red" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.border, '5px', 'Extracts border-width');
  });

  it('TBA: extractDataFromTableElement 5 - border width from border attr', () => {
    const editor = hook.editor();
    editor.options.set('table_style_by_css', false);
    editor.setContent(
      '<table class="foo" border="5"><tbody><tr><td>a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.border, '5', 'Extracts border');
    editor.options.unset('table_style_by_css');
  });

  it('TBA: extractDataFromTableElement 6 - border width from children', () => {
    const editor = hook.editor();
    editor.options.set('table_style_by_css', false);
    editor.setContent(
      '<table class="foo"><tbody><tr><td style="border-width: 5px;">a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.border, '5px', 'Extracts border-width');
    editor.options.unset('table_style_by_css');
  });

  it('TBA: extractDataFromTableElement 7 - border width, style and color from collapsed style', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table class="foo" style="border: 5px double red" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
    );
    const table = UiFinder.findIn(TinyDom.body(editor), 'table.foo').getOrDie();
    const tableData = Helpers.extractDataFromTableElement(editor, table.dom, true);
    assert.equal(tableData.border, '5px', 'Extracts border-width');
    assert.equal(tableData.borderstyle, 'double', 'Extracts border-style');
    assert.equal(tableData.bordercolor, 'red', 'Extracts border-color');
  });
});
