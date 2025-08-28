import { ApproxStructure } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as TableTestUtils from '../../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.command.ApplyCellStyleCommandTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };
  const clearEvents = () => events = [];

  const defaultEvents = [ 'tablemodified' ];
  const assertEvents = (expectedEvents: string[] = defaultEvents) => {
    if (events.length > 0) {
      Arr.each(events, (event) => {
        const tableElm = SugarElement.fromDom(event.table);
        assert.isFalse(event.structure, 'Cell style commands do not modify table structure');
        assert.isTrue(event.style, 'Cell style commands modify table style');
        assert.isTrue(SugarNode.isTag('table')(tableElm), 'Expected events should have been fired');
        assert.isFalse(events[0].structure, 'Should not have structure modified');
        assert.isTrue(events[0].style, 'Should have style modified');
      });
    }
    assert.deepEqual(Arr.map(events, (event) => event.type), expectedEvents, 'Expected events should have been fired');
  };

  const table = '<table style="border-collapse: collapse; width: 100%;" border="1">' +
    '<tbody>' +
    '<tr>' +
    `<td style="width: 50%;">a</td>` +
    `<td style="width: 50%;">b</td>` +
    '</tr>' +
    '</tbody>' +
    '</table>';

  const mapStyles = (styles: Record<string, string>, str: ApproxStructure.StringApi) => Obj.map(styles, (val, _key) => str.is(val));

  const assertTableCellStructure = (editor: Editor, styles: Record<string, string> = {}) =>
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str, _arr) => s.element('table', {
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

  const applyCellStyle = (editor: Editor, args: Record<string, string>) =>
    editor.execCommand('mceTableApplyCellStyle', false, args);

  afterEach(() => {
    clearEvents();
  });

  it('TINY-6004: Apply command on empty editor', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent('');
    applyCellStyle(editor, { backgroundColor: 'red' });
    TinyAssertions.assertContent(editor, '');
    assertEvents([]);
  });

  it('TINY-6004: Apply command to a cell without any styles specified', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, {});
    assertTableCellStructure(editor);
    assertEvents([]);
  });

  it('TINY-6004: Apply command to a cell with invalid style specified', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { zzzz: 'red' });
    assertTableCellStructure(editor);
    assertEvents([]);
  });

  it('TINY-6004: Apply command to a cell with invalid style value specified', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { backgroundColor: 'zzz' });
    assertTableCellStructure(editor);
    assertEvents();
  });

  it('TINY-6004: Test applying, changing and removing single style', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { backgroundColor: 'red' });
    assertTableCellStructure(editor, { 'background-color': 'red' });
    applyCellStyle(editor, { backgroundColor: 'blue' });
    assertTableCellStructure(editor, { 'background-color': 'blue' });
    applyCellStyle(editor, { backgroundColor: '' });
    assertTableCellStructure(editor);
    assertEvents([
      'tablemodified',
      'tablemodified',
      'tablemodified'
    ]);
  });

  it('TINY-6004: Test applying, changing and removing multiple styles', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange' });
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'orange' });
    applyCellStyle(editor, { borderColor: 'blue' });
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'blue' });
    applyCellStyle(editor, { backgroundColor: '' });
    assertTableCellStructure(editor, { 'border-color': 'blue' });
    assertEvents([
      'tablemodified',
      'tablemodified',
      'tablemodified'
    ]);
  });

  it('TINY-6004: Test applying, changing and removing multiple styles with kebab-case', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { 'background-color': 'red', 'border-color': 'orange' });
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'orange' });
    applyCellStyle(editor, { 'border-color': 'blue' });
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'blue' });
    applyCellStyle(editor, { 'background-color': '' });
    assertTableCellStructure(editor, { 'border-color': 'blue' });
    assertEvents([
      'tablemodified',
      'tablemodified',
      'tablemodified'
    ]);
  });

  it('TINY-6004: Test applying and removing all valid styles', () => {
    const editor = hook.editor();
    assertEvents([]);
    editor.setContent(table);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    applyCellStyle(editor, { backgroundColor: 'red', borderColor: 'orange', borderStyle: 'dashed', borderWidth: '5px' });
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' });
    applyCellStyle(editor, {});
    assertTableCellStructure(editor, { 'background-color': 'red', 'border-color': 'orange', 'border-style': 'dashed', 'border-width': '5px' });
    applyCellStyle(editor, { backgroundColor: '', borderColor: '', borderStyle: '', borderWidth: '' });
    assertTableCellStructure(editor);
    assertEvents([
      'tablemodified',
      'tablemodified'
    ]);
  });

  it('TINY-9459: Should not apply command to table in noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent(table);
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      applyCellStyle(editor, { backgroundColor: 'red' });
      TinyAssertions.assertContent(editor, table);
    });
  });
});

