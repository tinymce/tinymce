import { Assertions, Chain, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import * as Helpers from 'tinymce/plugins/table/ui/Helpers';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DetectHeaderRowTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'No header rows', [
        tinyApis.sSetContent(
          '<table>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr'),
          Chain.op((tr) => {
            const rowData = Helpers.getRowType(editor, tr.dom());
            Assertions.assertEq('Detect as part of the tbody', 'tbody', rowData);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Tbody > tr > th is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<tbody><tr>' +
          '<th>text</th>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr'),
          Chain.op((tr) => {
            Helpers.detectHeaderRow(editor, tr.dom()).fold(
              () => Assertions.assertEq('Row incorrectly detected as not a header row', true, false), // would call failure() but want logs
              (rowData) => {
                Assertions.assertEq('Detect as part of the tbody', false, rowData.thead);
                Assertions.assertEq('Detect as ths', true, rowData.ths);
              }
            );
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Tbody > tr > ths is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<tbody><tr>' +
          '<th>text</th>' +
          '<th>more text</th>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr'),
          Chain.op((tr) => {
            const rowData = Helpers.detectHeaderRow(editor, tr.dom()).getOrDie();
            Assertions.assertEq('Detect as part of the tbody', false, rowData.thead);
            Assertions.assertEq('Detect as all ths', true, rowData.ths);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Tbody > tr > td+th is detected correctly as NOT a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '<th>more text</th>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr'),
          Chain.op((tr) => {
            const rowData = Helpers.getRowType(editor, tr.dom());
            Assertions.assertEq('Detect as part of the tbody', 'tbody', rowData);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Thead > tr > td is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<thead><tr class="foo">' +
          '<td>text</td>' +
          '</tr></thead>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr.foo'),
          Chain.op((tr) => {
            const rowData = Helpers.detectHeaderRow(editor, tr.dom()).getOrDie();
            Assertions.assertEq('Detect as part of the thead', true, rowData.thead);
            Assertions.assertEq('Detect as td', false, rowData.ths);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Thead > tr > th is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<thead><tr class="foo">' +
          '<th>text</th>' +
          '</tr></thead>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr.foo'),
          Chain.op((tr) => {
            const rowData = Helpers.detectHeaderRow(editor, tr.dom()).getOrDie();
            Assertions.assertEq('Detect as part of the thead', true, rowData.thead);
            Assertions.assertEq('Detect as all th', true, rowData.ths);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Thead > tr > ths is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<thead><tr class="foo">' +
          '<th>text</th>' +
          '<th>more text</th>' +
          '</tr></thead>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr.foo'),
          Chain.op((tr) => {
            const rowData = Helpers.detectHeaderRow(editor, tr.dom()).getOrDie();
            Assertions.assertEq('Detect as part of the thead', true, rowData.thead);
            Assertions.assertEq('Detect as all th', true, rowData.ths);
          })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Thead > tr > td+th is detected correctly as a header row', [
        tinyApis.sSetContent(
          '<table>' +
          '<thead><tr class="foo">' +
          '<td>text</td>' +
          '<th>more text</th>' +
          '</tr></thead>' +
          '<tbody><tr>' +
          '<td>text</td>' +
          '</tr></tbody>' +
          '</table>'
        ),
        Chain.asStep(Element.fromDom(editor.getBody()), [
          UiFinder.cFindIn('tr.foo'),
          Chain.op((tr) => {
            const rowData = Helpers.detectHeaderRow(editor, tr.dom()).getOrDie();
            Assertions.assertEq('Detect as part of the thead', true, rowData.thead);
            Assertions.assertEq('Detect as not all th', false, rowData.ths);
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
