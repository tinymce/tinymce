import { ApproxStructure, Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.command.ApplyCellStyleCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  let events = [];
  const logEvent = (event: EditorEvent<{}>) => {
    events.push(event);
  };

  const sClearEvents = Step.sync(() => events = []);

  const defaultEvents = [ 'tablemodified' ];
  const sAssertEvents = (expectedEvents: string[] = defaultEvents) => Step.sync(() => {
    if (events.length > 0) {
      Arr.each(events, (event) => {
        const tableElm = SugarElement.fromDom(event.table);
        Assertions.assertEq('Cell style commands do not modify table structure', event.structure, false);
        Assertions.assertEq('Cell style commands modify table style', event.style, true);
        Assertions.assertEq('Expected events should have been fired', true, SugarNode.isTag('table')(tableElm));
        Assertions.assertEq('Should not have structure modified', false, events[0].structure);
        Assertions.assertEq('Should have style modified', true, events[0].style);
      });
    }
    Assertions.assertEq('Expected events should have been fired', expectedEvents, Arr.map(events, (event) => event.type));
  });

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const table = '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;" >a</td>` +
      `<td style="width: 50%;" >b</td>` +
      '</tr>' +
      '</tbody>' +
      '</table>';

    const mapStyles = (styles: Record<string, string>, str: ApproxStructure.StringApi) => Obj.map(styles, (val, _key) => str.is(val));

    const sAssertTableCellStructure = (styles: Record<string, string> = {}) =>
      TableTestUtils.sAssertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
        styles: {
          'width': str.is('100%'),
          'border-collapse': str.is('collapse')
        },
        attrs: {
          border: str.is('1')
        },
        children: [
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('td', {
                    styles: {
                      width: str.is('50%'),
                      ...mapStyles(styles, str)
                    },
                    children: [
                      s.text(str.is('a'))
                    ]
                  }),
                  s.element('td', {
                    styles: {
                      width: str.is('50%')
                    },
                    children: [
                      s.text(str.is('b'))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })));

    const sApplyCellStyle = (editor: Editor, args: Record<string, string>) => Step.sync(() => editor.execCommand('mceTableApplyCellStyle', false, args));

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TINY-6004', `Apply command on empty editor`, [
        sAssertEvents([]),
        tinyApis.sSetContent(''),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        tinyApis.sAssertContent(''),
        sAssertEvents([])
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell without any styles specified`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, {}),
        sAssertTableCellStructure(),
        sAssertEvents([])
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style specified`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { zzzz: 'red' }),
        sAssertTableCellStructure(),
        sAssertEvents([])
      ]),
      Log.stepsAsStep('TINY-6004', `Apply command to a cell with invalid style value specified`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'zzz' }),
        sAssertTableCellStructure(),
        sAssertEvents(),
        sClearEvents
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing single style`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red' }),
        sAssertTableCellStructure({ 'background-color': 'red' }),
        sApplyCellStyle(editor, { backgroundColor: 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'blue' }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAssertTableCellStructure(),
        sAssertEvents([
          'tablemodified',
          'tablemodified',
          'tablemodified'
        ]),
        sClearEvents
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }),
        sApplyCellStyle(editor, { borderColor: 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }),
        sApplyCellStyle(editor, { backgroundColor: '' }),
        sAssertTableCellStructure({ 'border-color': 'blue' }),
        sAssertEvents([
          'tablemodified',
          'tablemodified',
          'tablemodified'
        ]),
        sClearEvents
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying, changing and removing multiple styles with kebab-case`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { 'background-color': 'red', 'border-color': 'orange' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange' }),
        sApplyCellStyle(editor, { 'border-color': 'blue' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'blue' }),
        sApplyCellStyle(editor, { 'background-color': '' }),
        sAssertTableCellStructure({ 'border-color': 'blue' }),
        sAssertEvents([
          'tablemodified',
          'tablemodified',
          'tablemodified'
        ]),
        sClearEvents
      ]),
      Log.stepsAsStep('TINY-6004', `Test applying and removing all valid styles`, [
        sAssertEvents([]),
        tinyApis.sSetContent(table),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        sApplyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange', borderStyle: 'dashed', borderWidth: '5px' }),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' }),
        sApplyCellStyle(editor, {}),
        sAssertTableCellStructure({ 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' }),
        sApplyCellStyle(editor, { backgroundColor: '', borderColor: '', borderStyle: '', borderWidth: '' }),
        sAssertTableCellStructure(),
        sAssertEvents([
          'tablemodified',
          'tablemodified'
        ]),
        sClearEvents
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, success, failure);
});

