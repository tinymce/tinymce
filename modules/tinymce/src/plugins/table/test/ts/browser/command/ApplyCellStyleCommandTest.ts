import { ApproxStructure } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';
import { Attribute, SelectorFilter, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.command.ApplyCellStyleCommandTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

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
    `<td style="width: 50%;" >a</td>` +
    `<td style="width: 50%;" >b</td>` +
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

  context('border normalization', () => {
    context('border normalization single cell', () => {
      const testSingleCellNormalization = (initialStyles: string, styles: Record<string, string>, expectedStyles: string) => {
        const editor = hook.editor();
        const html = `<table><tbody><tr><td style="${initialStyles}">x</td></tr></tbody></table>`;

        editor.setContent(html);
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        applyCellStyle(editor, styles);

        const actualStyles = editor.dom.getAttrib(editor.selection.getNode(), 'style');

        assert.equal(actualStyles, expectedStyles);
      };

      it('TINY-7593: should switch border-style to double when setting a border-color on a 1px border-width cell', () =>
        testSingleCellNormalization('border: 1px solid red', { borderColor: 'blue' }, 'border: 1px double blue;')
      );

      it('TINY-7593: should switch border-style to double when setting a border-width to 1px when the cell has border-color', () =>
        testSingleCellNormalization('border: 2px solid red', { borderWidth: '1px' }, 'border: 1px double red;')
      );

      it('TINY-7593: should increase the border-width to 2px if border-style is set to dashed on 1px border-width cell', () =>
        testSingleCellNormalization('border: 1px solid red', { borderStyle: 'dashed' }, 'border: 2px dashed red;')
      );
    });

    context('border normalization multiple cells', () => {
      const testMultipleCellNormalization = (initialStyles: string[], styles: Record<string, string>, expectedStyles: string[]) => {
        const editor = hook.editor();
        const cellsHtml = Arr.foldl(initialStyles, (acc, style) => acc + `<td style="${style}">x</td>`, '');
        const html = `<table><tbody><tr>${cellsHtml}</tr></tbody></table>`;

        editor.setContent(html);

        const cells = SelectorFilter.descendants(TinyDom.body(editor), 'td');

        Arr.each(cells, (cell) => Attribute.set(cell, 'data-mce-selected', '1'));
        TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, cells.length - 1, 0 ], 0);

        applyCellStyle(editor, styles);

        const actualStyles = Arr.map(cells, (cell) => editor.dom.getAttrib(cell.dom, 'style'));

        assert.deepEqual(actualStyles, expectedStyles);
      };

      it('TINY-7593: should normalize the first and last cells since they have a 1px border-width and we are applying border-color: blue', () =>
        testMultipleCellNormalization(
          [ 'border: 1px solid red', 'border: 2px solid red', 'border: 1px solid red' ],
          { borderColor: 'blue' },
          [ 'border: 1px double blue;', 'border: 2px solid blue;', 'border: 1px double blue;' ]
        )
      );

      it('TINY-7593: should normalize the first and last cells since they have a 1px border-width and we are applying border-style: dashed', () =>
        testMultipleCellNormalization(
          [ 'border: 1px solid red', 'border: 2px solid red', 'border: 1px solid red' ],
          { borderStyle: 'dashed' },
          [ 'border: 2px dashed red;', 'border: 2px dashed red;', 'border: 2px dashed red;' ]
        )
      );
    });
  });
});

