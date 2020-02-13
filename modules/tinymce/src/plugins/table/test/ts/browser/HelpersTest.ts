import { Assertions, Chain, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Helpers from 'tinymce/plugins/table/ui/Helpers';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.HelpersTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: extractDataFromCellElement 1', [
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td width="20" height="30" scope="row" class="foo" style="background-color: #333333; text-align:left; vertical-align:middle; border-style: dashed; border-color: #d91111">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('td.foo'),
          Chain.op((td) => {
            const cellData = Helpers.extractDataFromCellElement(editor, td.dom(), true);
            Assertions.assertEq('Extracts class', 'foo', cellData.class);
            Assertions.assertEq('Extracts scope', 'row', cellData.scope);
            Assertions.assertEq('Extracts celltype', 'td', cellData.celltype);
            Assertions.assertEq('Extracts halign', 'left', cellData.halign);
            Assertions.assertEq('Extracts valign', 'middle', cellData.valign);
            Assertions.assertEq('Extracts width', '20', cellData.width);
            Assertions.assertEq('Extracts height', '30', cellData.height);

            Assertions.assertEq('Extracts background-color', '#333333', cellData.backgroundcolor);
            Assertions.assertEq('Extracts border-color', '#d91111', cellData.bordercolor);
            Assertions.assertEq('Extracts border-style', 'dashed', cellData.borderstyle);

          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromCellElement 2', [
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td class="foo" style="width: 20px; height: 30px; background-color: rgb(51,51,51); border-color: rgb(217, 17, 17);" data-mce-selected="1">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('td.foo'),
          Chain.op((td) => {
            const cellData = Helpers.extractDataFromCellElement(editor, td.dom(), true);
            Assertions.assertEq('Extracts width from style', '20px', cellData.width);
            Assertions.assertEq('Extracts height from style', '30px', cellData.height);
            Assertions.assertEq('Extracts background-color from rgb', '#333333', cellData.backgroundcolor);
            Assertions.assertEq('Extracts border-color from rgb', '#d91111', cellData.bordercolor);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromCellElement 2', [
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td class="foo" style="width: 20px; height: 30px; border: medium dashed #008000;" data-mce-selected="1">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('td.foo'),
          Chain.op((td) => {
            const cellData = Helpers.extractDataFromCellElement(editor, td.dom(), true);
            Assertions.assertEq('Extracts border-color from shorthand', '#008000', cellData.bordercolor);
            Assertions.assertEq('Extracts border-style from shorthand', 'dashed', cellData.borderstyle);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromRowElement', [
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr scope="row" class="foo" style="height:30px; background-color: #333333; text-align:left; vertical-align:middle; border-style: dashed; border-color: #d91111"><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr.foo'),
          Chain.op((tr) => {
            const rowData = Helpers.extractDataFromRowElement(editor, tr.dom(), true);
            Assertions.assertEq('Extracts height', '30px', rowData.height);
            // Assertions.assertEq('Extracts scope', 'row', rowData.scope); // Chrome won't set a scope on a tr?
            Assertions.assertEq('Extracts class', 'foo', rowData.class);
            Assertions.assertEq('Extracts align', 'left', rowData.align);
            Assertions.assertEq('Extracts type', 'tbody', rowData.type);
            Assertions.assertEq('Extracts border-style', 'dashed', rowData.borderstyle);
            Assertions.assertEq('Extracts border-color', '#d91111', rowData.bordercolor);
            Assertions.assertEq('Extracts background-color', '#333333', rowData.backgroundcolor);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 1', [
        tinyApis.sSetContent(
          '<table class="foo" cellspacing="1" cellpadding="2" style="margin-left: auto; margin-right: auto; width: 20px; height:30px;"><caption>A caption</caption><tbody><tr><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts class', 'foo mce-item-table', tableData.class);
            Assertions.assertEq('Extracts width', '20px', tableData.width);
            Assertions.assertEq('Extracts height', '30px', tableData.height);
            Assertions.assertEq('Extracts cellspacing', '1', tableData.cellspacing);
            Assertions.assertEq('Extracts cellpadding', '2', tableData.cellpadding);
            Assertions.assertEq('Extracts caption', true, tableData.caption);
            Assertions.assertEq('Extracts align', 'center', tableData.align);

          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 2 - right alignment', [
        tinyApis.sSetContent(
          '<table class="foo" style="float: right;"><tbody><tr><td style="padding: 99px;">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts cellpadding from td', '99px', tableData.cellpadding);
            Assertions.assertEq('Extracts align', 'right', tableData.align);

          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 2 - left alignment', [
        tinyApis.sSetContent(
          '<table class="foo" style="float: left;"><tbody><tr><td style="padding: 99px;">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts align', 'left', tableData.align);

          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 3 - border width from border-width style', [
        tinyApis.sSetSetting('table_style_by_css', true),
        tinyApis.sSetContent(
          '<table class="foo" style="border-width: 5px" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts border-width', '5px', tableData.border);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 4 - border width from border style', [
        tinyApis.sSetSetting('table_style_by_css', true),
        tinyApis.sSetContent(
          '<table class="foo" style="border: 5px solid red" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts border-width', '5px', tableData.border);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 5 - border width from border attr', [
        tinyApis.sSetSetting('table_style_by_css', false),
        tinyApis.sSetContent(
          '<table class="foo" border="5"><tbody><tr><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts border', '5', tableData.border);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 6 - border width from children', [
        tinyApis.sSetSetting('table_style_by_css', false),
        tinyApis.sSetContent(
          '<table class="foo"><tbody><tr><td style="border-width: 5px;">a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts border-width', '5px', tableData.border);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Table: extractDataFromTableElement 7 - border width, style and color from collapsed style', [
        tinyApis.sSetSetting('table_style_by_css', true),
        tinyApis.sSetContent(
          '<table class="foo" style="border: 5px double red" border="1"><tbody><tr><td>a</td></tr></tbody></table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('table.foo'),
          Chain.op((table) => {
            const tableData = Helpers.extractDataFromTableElement(editor, table.dom(), true);
            Assertions.assertEq('Extracts border-width', '5px', tableData.border);
            Assertions.assertEq('Extracts border-style', 'double', tableData.borderstyle);
            Assertions.assertEq('Extracts border-color', 'red', tableData.bordercolor);
          })
        ])
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent : false,
    theme : 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure );
});
