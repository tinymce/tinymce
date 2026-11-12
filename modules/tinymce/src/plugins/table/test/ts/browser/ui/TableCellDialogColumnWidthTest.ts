import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Html, SelectorFilter, SelectorFind, SugarElement, Width } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

interface TableWidths {
  readonly table: string;
  readonly cols: string[];
  readonly rows: string[][];
}

interface TestCase {
  readonly html: string;
  readonly setWidth: string;
  readonly expected: TableWidths;
}

describe('browser.tinymce.plugins.table.TableCellDialogColumnWidthTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    toolbar: 'tablecellprops',
    base_url: '/project/tinymce/js/tinymce',
    table_cell_advtab: false,
    content_style: 'table, table td, table th { border: 0 !important; padding: 0 !important; }'
  }, [ Plugin ], true);

  const third = 'style="width: 33.3333%;"';
  const selected = 'data-mce-selected="1"';

  const roundWidth = (raw: string): string =>
    Math.round(parseFloat(raw)) + raw.replace(/^[\d.]+/, '');

  const getWidth = (elm: SugarElement<HTMLElement>): string =>
    Css.getRaw(elm, 'width').map(roundWidth).getOr('');

  const getContentWidths = (editor: Editor): TableWidths => {
    const container = SugarElement.fromTag('div');
    Html.set(container, editor.getContent());
    const table = SelectorFind.descendant<HTMLTableElement>(container, 'table').getOrDie('Should have a table');
    return {
      table: getWidth(table),
      cols: Arr.map(SelectorFilter.descendants<HTMLTableColElement>(table, 'col'), getWidth),
      rows: Arr.map(SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr'), (row) =>
        Arr.map(SelectorFilter.children<HTMLTableCellElement>(row, 'td,th'), getWidth)
      )
    };
  };

  const getRenderedPercentWidths = (editor: Editor): number[] => {
    const row = SelectorFind.descendant<HTMLTableRowElement>(TinyDom.body(editor), 'tr').getOrDie('Should have a row');
    return Arr.map(SelectorFilter.children<HTMLTableCellElement>(row, 'td'), (cell) => Width.get(cell) / Width.getInner(row) * 100);
  };

  const setSelectedContent = (editor: Editor, html: string): void => {
    editor.setContent(html);
    TinySelections.select(editor, 'td[data-mce-selected]', [ 0 ]);
  };

  const pSetCellWidth = async (editor: Editor, width: string): Promise<void> => {
    await TableTestUtils.pOpenTableDialog(editor);
    TableTestUtils.setDialogValues({ width }, false, { width: 'Width' });
    await TableTestUtils.pClickDialogButton(editor, true);
  };

  const pTest = async ({ html, setWidth, expected }: TestCase): Promise<void> => {
    const editor = hook.editor();
    setSelectedContent(editor, html);
    await pSetCellWidth(editor, setWidth);
    assert.deepEqual<TableWidths>(getContentWidths(editor), expected);
  };

  context('Rebalances the neighbouring column', () => {
    it('TINYMCE-13193: percent table without colgroup', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${selected} ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td ${third}>A2</td><td ${third}>B2</td><td ${third}>C2</td></tr>` +
      '</tbody></table>',
      setWidth: '20%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '33%', '20%', '47%' ],
          [ '33%', '20%', '47%' ]
        ]
      }
    }));

    it('TINYMCE-13193: percent table without colgroup whose widths add up to more than 100%', async () => {
      const editor = hook.editor();
      setSelectedContent(editor,
        '<table style="width: 100%;"><tbody>' +
          `<tr><td ${selected} style="width: 50%;">A</td><td style="width: 50%;">B</td><td style="width: 50%;">C</td></tr>` +
          '<tr><td style="width: 50%;">A2</td><td style="width: 50%;">B2</td><td style="width: 50%;">C2</td></tr>' +
        '</tbody></table>'
      );
      const [ a, b, c ] = getRenderedPercentWidths(editor);
      const expectedRow = Arr.map([ 20, a + b - 20, c ], (w) => Math.round(w) + '%');
      await pSetCellWidth(editor, '20%');
      assert.deepEqual<TableWidths>(getContentWidths(editor), {
        table: '100%',
        cols: [],
        rows: [ expectedRow, expectedRow ]
      });
    });

    it('TINYMCE-13193: percent table with colgroup', () => pTest({
      html: '<table style="width: 100%;">' +
        '<colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>' +
        '<tbody>' +
          `<tr><td>A</td><td ${selected}>B</td><td>C</td><td>D</td></tr>` +
          '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
        '</tbody>' +
      '</table>',
      setWidth: '40%',
      expected: {
        table: '100%',
        cols: [ '25%', '40%', '10%', '25%' ],
        rows: [
          [ '', '', '', '' ],
          [ '', '', '', '' ]
        ]
      }
    }));

    it('TINYMCE-13193: percent table with colgroup whose widths add up to more than 100%', async () => {
      const editor = hook.editor();
      setSelectedContent(editor,
        '<table style="width: 100%;">' +
          '<colgroup><col style="width: 50%;"><col style="width: 50%;"><col style="width: 50%;"></colgroup>' +
          `<tbody><tr><td ${selected}>A</td><td>B</td><td>C</td></tr></tbody>` +
        '</table>'
      );
      const [ a, b, c ] = getRenderedPercentWidths(editor);
      await pSetCellWidth(editor, '30%');
      assert.deepEqual<TableWidths>(getContentWidths(editor), {
        table: '100%',
        cols: Arr.map([ 30, a + b - 30, c ], (w) => Math.round(w) + '%'),
        rows: [[ '', '', '' ]]
      });
    });

    it('TINYMCE-13193: last column takes the width from the previous column', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${third}>A</td><td ${third}>B</td><td ${selected} ${third}>C</td></tr></tbody></table>`,
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '33%', '17%', '50%' ]]
      }
    }));

    it('TINYMCE-13193: cell spanning the resized column gets the sum of the columns it spans', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${selected} ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td colspan="2" style="width: 66.6666%;">D</td><td ${third}>E</td></tr>` +
      '</tbody></table>',
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '33%', '50%', '17%' ],
          [ '83%', '17%' ]
        ]
      }
    }));

    it('TINYMCE-13193: multiple cells selected in the same column', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${selected} ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td ${third}>A2</td><td ${selected} ${third}>B2</td><td ${third}>C2</td></tr>` +
      '</tbody></table>',
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '33%', '50%', '17%' ],
          [ '33%', '50%', '17%' ]
        ]
      }
    }));

    it('TINYMCE-13193: selection across multiple columns', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${selected} ${third}>A</td><td ${selected} ${third}>B</td><td ${third}>C</td></tr></tbody></table>`,
      setWidth: '20%',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '20%', '20%', '60%' ]]
      }
    }));

    it('TINYMCE-13193: selection across multiple columns ending at the last column', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${third}>A</td><td ${selected} ${third}>B</td><td ${selected} ${third}>C</td></tr></tbody></table>`,
      setWidth: '20%',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '33%', '47%', '20%' ]]
      }
    }));

    it('TINYMCE-13193: selection across multiple columns and rows with colgroup', () => pTest({
      html: '<table style="width: 100%;">' +
        '<colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>' +
        '<tbody>' +
          `<tr><td ${selected}>A</td><td ${selected}>B</td><td>C</td><td>D</td></tr>` +
          `<tr><td ${selected}>A2</td><td ${selected}>B2</td><td>C2</td><td>D2</td></tr>` +
        '</tbody>' +
      '</table>',
      setWidth: '20%',
      expected: {
        table: '100%',
        cols: [ '20%', '20%', '35%', '25%' ],
        rows: [
          [ '', '', '', '' ],
          [ '', '', '', '' ]
        ]
      }
    }));

    it('TINYMCE-13193: pixel table with selection across multiple columns', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td style="width: 100px;">A</td><td ${selected} style="width: 100px;">B</td><td ${selected} style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
      '</tbody></table>',
      setWidth: '50px',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '100px', '50px', '50px', '200px' ]]
      }
    }));

    it('TINYMCE-13193: width too large for multiple columns is clamped by each drag', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 100px;">A</td><td ${selected} style="width: 100px;">B</td><td style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
      '</tbody></table>',
      setWidth: '300px',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '190px', '100px', '10px', '100px' ]]
      }
    }));

    it('TINYMCE-13193: pixel table without colgroup', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 100px;">A</td><td style="width: 100px;">B</td><td style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
        '<tr><td style="width: 100px;">A2</td><td style="width: 100px;">B2</td><td style="width: 100px;">C2</td><td style="width: 100px;">D2</td></tr>' +
      '</tbody></table>',
      setWidth: '150',
      expected: {
        table: '400px',
        cols: [],
        rows: [
          [ '150px', '50px', '100px', '100px' ],
          [ '150px', '50px', '100px', '100px' ]
        ]
      }
    }));

    it('TINYMCE-13193: pixel table with colgroup', () => pTest({
      html: '<table style="width: 300px;">' +
        '<colgroup><col style="width: 100px;"><col style="width: 100px;"><col style="width: 100px;"></colgroup>' +
        `<tbody><tr><td>A</td><td ${selected}>B</td><td>C</td></tr></tbody>` +
      '</table>',
      setWidth: '150px',
      expected: {
        table: '300px',
        cols: [ '100px', '150px', '50px' ],
        rows: [[ '', '', '' ]]
      }
    }));

    it('TINYMCE-13193: last column of a pixel table takes the width from the previous column', () => pTest({
      html: '<table style="width: 300px;"><tbody>' +
        `<tr><td style="width: 100px;">A</td><td style="width: 100px;">B</td><td ${selected} style="width: 100px;">C</td></tr>` +
      '</tbody></table>',
      setWidth: '150px',
      expected: {
        table: '300px',
        cols: [],
        rows: [[ '100px', '50px', '150px' ]]
      }
    }));

    it('TINYMCE-13193: width is clamped so the neighbouring column keeps the minimum cell width', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 100px;">A</td><td style="width: 100px;">B</td><td style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
      '</tbody></table>',
      setWidth: '400px',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '190px', '10px', '100px', '100px' ]]
      }
    }));

    it('TINYMCE-13193: merged cell moves its right border', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td ${selected} colspan="2" style="width: 66.6666%;">D</td><td ${third}>E</td></tr>` +
      '</tbody></table>',
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '33%', '17%', '50%' ],
          [ '50%', '50%' ]
        ]
      }
    }));

    it('TINYMCE-13193: merged cell ending at the last column moves its left border', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td ${third}>D</td><td ${selected} colspan="2" style="width: 66.6666%;">E</td></tr>` +
      '</tbody></table>',
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '50%', '17%', '33%' ],
          [ '50%', '50%' ]
        ]
      }
    }));

    it('TINYMCE-13193: merged cell in a table with colgroup moves its right border', () => pTest({
      html: '<table style="width: 100%;">' +
        '<colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>' +
        '<tbody>' +
          '<tr><td>A</td><td>B</td><td>C</td><td>D</td></tr>' +
          `<tr><td>A2</td><td ${selected} colspan="2">B2</td><td>D2</td></tr>` +
        '</tbody>' +
      '</table>',
      setWidth: '60%',
      expected: {
        table: '100%',
        cols: [ '25%', '25%', '35%', '15%' ],
        rows: [
          [ '', '', '', '' ],
          [ '', '', '' ]
        ]
      }
    }));

    it('TINYMCE-13193: single column percent table keeps the table width', () => pTest({
      html: `<table style="width: 80%;"><tbody><tr><td ${selected} style="width: 100%;">A</td></tr></tbody></table>`,
      setWidth: '50%',
      expected: {
        table: '80%',
        cols: [],
        rows: [[ '100%' ]]
      }
    }));

    it('TINYMCE-13193: single column pixel table keeps the table width', () => pTest({
      html: `<table style="width: 400px;"><tbody><tr><td ${selected} style="width: 400px;">A</td></tr></tbody></table>`,
      setWidth: '300px',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '400px' ]]
      }
    }));

    it('TINYMCE-13193: merged cell spanning every column keeps the table width', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr>` +
        `<tr><td ${selected} colspan="3" style="width: 100%;">D</td></tr>` +
      '</tbody></table>',
      setWidth: '50%',
      expected: {
        table: '100%',
        cols: [],
        rows: [
          [ '33%', '33%', '33%' ],
          [ '100%' ]
        ]
      }
    }));

    it('TINYMCE-13193: selection across every column drags each column in turn', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${selected} ${third}>A</td><td ${selected} ${third}>B</td><td ${selected} ${third}>C</td></tr></tbody></table>`,
      setWidth: '20%',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '20%', '60%', '20%' ]]
      }
    }));

    it('TINYMCE-13193: selection across every column of uneven widths drags each column in turn', () => pTest({
      html: '<table style="width: 100%;"><tbody>' +
        `<tr><td ${selected} style="width: 20%;">A</td><td ${selected} style="width: 30%;">B</td><td ${selected} style="width: 50%;">C</td></tr>` +
      '</tbody></table>',
      setWidth: '25%',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '25%', '50%', '25%' ]]
      }
    }));

    it('TINYMCE-13193: selection across every column of a pixel table drags each column in turn', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 50px;">A</td><td ${selected} style="width: 100px;">B</td><td ${selected} style="width: 250px;">C</td></tr>` +
      '</tbody></table>',
      setWidth: '10px',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '10px', '380px', '10px' ]]
      }
    }));

    it('TINYMCE-13193: percent width on a pixel table is converted to pixels', () => pTest({
      html: '<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 100px;">A</td><td style="width: 100px;">B</td><td style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
      '</tbody></table>',
      setWidth: '37.5%',
      expected: {
        table: '400px',
        cols: [],
        rows: [[ '150px', '50px', '100px', '100px' ]]
      }
    }));

    it('TINYMCE-13193: pixel width on a percent table is converted to percent', async () => {
      const editor = hook.editor();
      setSelectedContent(editor,
        `<table style="width: 100%;"><tbody><tr><td ${selected} ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr></tbody></table>`
      );
      const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Should have a table');
      const target = 100 / Width.get(table) * 100;
      const [ a, b, c ] = getRenderedPercentWidths(editor);
      const expectedRow = Arr.map([ target, a + b - target, c ], (w) => Math.round(w) + '%');
      await pSetCellWidth(editor, '100px');
      assert.deepEqual<TableWidths>(getContentWidths(editor), {
        table: '100%',
        cols: [],
        rows: [ expectedRow ]
      });
    });

    it('TINYMCE-13193: percent width on a pixel table with colgroup is converted to pixels', () => pTest({
      html: '<table style="width: 300px;">' +
        '<colgroup><col style="width: 100px;"><col style="width: 100px;"><col style="width: 100px;"></colgroup>' +
        `<tbody><tr><td>A</td><td ${selected}>B</td><td>C</td></tr></tbody>` +
      '</table>',
      setWidth: '50%',
      expected: {
        table: '300px',
        cols: [ '100px', '150px', '50px' ],
        rows: [[ '', '', '' ]]
      }
    }));

    it('TINYMCE-13193: a single undo restores every column that was changed', async () => {
      const editor = hook.editor();
      editor.resetContent('<table style="width: 400px;"><tbody>' +
        `<tr><td ${selected} style="width: 100px;">A</td><td style="width: 100px;">B</td><td style="width: 100px;">C</td><td style="width: 100px;">D</td></tr>` +
      '</tbody></table>');
      TinySelections.select(editor, 'td[data-mce-selected]', [ 0 ]);
      await pSetCellWidth(editor, '150px');
      editor.undoManager.undo();
      assert.deepEqual<TableWidths>(getContentWidths(editor), {
        table: '400px',
        cols: [],
        rows: [[ '100px', '100px', '100px', '100px' ]]
      });
    });
  });

  context('Only sets the width of the edited cells', () => {
    it('TINYMCE-13193: table without a width', () => pTest({
      html: `<table><tbody><tr><td ${selected} ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr></tbody></table>`,
      setWidth: '20%',
      expected: {
        table: '',
        cols: [],
        rows: [[ '20%', '33%', '33%' ]]
      }
    }));

    it('TINYMCE-13193: pixel width on a table without a width', () => pTest({
      html: `<table><tbody><tr><td ${selected} ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr></tbody></table>`,
      setWidth: '100px',
      expected: {
        table: '',
        cols: [],
        rows: [[ '100px', '33%', '33%' ]]
      }
    }));

    it('TINYMCE-13193: width in a unit other than px or %', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${selected} ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr></tbody></table>`,
      setWidth: '10em',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '10em', '33%', '33%' ]]
      }
    }));

    it('TINYMCE-13193: clearing the width', () => pTest({
      html: `<table style="width: 100%;"><tbody><tr><td ${selected} ${third}>A</td><td ${third}>B</td><td ${third}>C</td></tr></tbody></table>`,
      setWidth: '',
      expected: {
        table: '100%',
        cols: [],
        rows: [[ '', '33%', '33%' ]]
      }
    }));
  });
});
