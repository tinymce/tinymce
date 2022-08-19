import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/test/TableUtils';

interface SelectedCells {
  readonly cell1?: boolean;
  readonly cell2?: boolean;
  readonly cell3?: boolean;
  readonly cell4?: boolean;
}

describe('browser.tinymce.core.table.TableFormatsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const beforeTable = (selectedCells: SelectedCells = {}) => {
    const { cell1, cell2, cell3, cell4 } = selectedCells;
    return '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;" ${cell1 ? 'data-mce-selected="1"' : ''}>a</td>` +
      `<td style="width: 50%;" ${cell2 ? 'data-mce-selected="1"' : ''}>b</td>` +
      '</tr>' +
      '<tr>' +
      `<td style="width: 50%;" ${cell3 ? 'data-mce-selected="1"' : ''}>c</td>` +
      `<td style="width: 50%;" ${cell4 ? 'data-mce-selected="1"' : ''}>d</td>` +
      '</tr>' +
      '</tbody>' +
      '</table>';
  };

  const assertTableCellStructure = (editor: Editor, styles: Record<string, string> = {}, selectedCells: SelectedCells = {}) => {
    const { cell1, cell2, cell3, cell4 } = selectedCells;
    const mapStyles = (styles: Record<string, string>, str: ApproxStructure.StringApi) => Obj.map(styles, (val, _key) => str.is(val));
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
                    ...cell1 ? mapStyles(styles, str) : {}
                  },
                  children: [
                    s.text(str.is('a'))
                  ]
                }),
                s.element('td', {
                  styles: {
                    width: str.is('50%'),
                    ...cell2 ? mapStyles(styles, str) : {}
                  },
                  children: [
                    s.text(str.is('b'))
                  ]
                })
              ]
            }),
            s.element('tr', {
              children: [
                s.element('td', {
                  styles: {
                    width: str.is('50%'),
                    ...cell3 ? mapStyles(styles, str) : {}
                  },
                  children: [
                    s.text(str.is('c'))
                  ]
                }),
                s.element('td', {
                  styles: {
                    width: str.is('50%'),
                    ...cell4 ? mapStyles(styles, str) : {}
                  },
                  children: [
                    s.text(str.is('d'))
                  ]
                })
              ]
            })
          ]
        })
      ]
    })));
  };

  const applyFormat = (editor: Editor, formatName: string, vars: Record<string, string>) => editor.formatter.apply(formatName, vars);
  const removeFormat = (editor: Editor, formatName: string, vars: Record<string, string>) => editor.formatter.remove(formatName, vars);

  Arr.each<{ formatName: string; vars: Record<string, string>; styles: Record<string, string> }>([
    { formatName: 'tablecellbackgroundcolor', vars: { value: 'red' }, styles: { 'background-color': 'red' }},
    { formatName: 'tablecellbordercolor', vars: { value: 'red' }, styles: { 'border-color': 'red' }},
    { formatName: 'tablecellborderstyle', vars: { value: 'dashed' }, styles: { 'border-style': 'dashed' }},
    { formatName: 'tablecellborderwidth', vars: { value: '5px' }, styles: { 'border-width': '5px' }}
  ], (test) => {
    const { formatName, vars, styles } = test;

    context(`Table cell format for ${formatName}`, () => {
      it('TINY-6004: Apply format to empty editor', () => {
        const editor = hook.editor();
        editor.setContent('');
        applyFormat(editor, formatName, vars);
        TinyAssertions.assertContent(editor, '');
      });

      it('TINY-6004: Apply format on single cell with cursor in it', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable());
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true });
      });

      it('TINY-6004: Apply format on single cell selection (cell)', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable({ cell1: true }));
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true });
      });

      it('TINY-6004: Apply format on multi cell selection (row)', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable({ cell1: true, cell2: true }));
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true, cell2: true });
      });

      it('TINY-6004: Apply format on multi cell selection (col)', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable({ cell1: true, cell3: true }));
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true, cell3: true });
      });

      it('TINY-6004: Apply format on multi cell selection (table)', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true }));
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true, cell2: true, cell3: true, cell4: true });
      });

      it('TINY-6004: Apply format on single cell with cursor in it then remove format', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable());
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true });
        removeFormat(editor, formatName, vars);
        assertTableCellStructure(editor);
      });

      it('TINY-6004: Apply format on multi cell selection (table) then remove format', () => {
        const editor = hook.editor();
        editor.setContent(beforeTable({ cell1: true, cell2: true, cell3: true, cell4: true }));
        applyFormat(editor, formatName, vars);
        assertTableCellStructure(editor, styles, { cell1: true, cell2: true, cell3: true, cell4: true });
        removeFormat(editor, formatName, vars);
        assertTableCellStructure(editor);
      });
    });
  });
});

