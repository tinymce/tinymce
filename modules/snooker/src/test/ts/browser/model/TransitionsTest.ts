import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SugarElement, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Transitions from 'ephox/snooker/model/Transitions';
import * as Bridge from 'ephox/snooker/test/Bridge';

describe('TransitionsTest', () => {
  const createCell = (text: string): SugarElement<HTMLTableCellElement> => {
    const elem = SugarElement.fromTag('td');
    TextContent.set(elem, text);
    return elem;
  };

  const createCol = (id: string): SugarElement<HTMLTableColElement> => {
    const elem = SugarElement.fromTag('col');
    Attribute.set(elem, 'data-id', id);
    return elem;
  };

  const re = () => SugarElement.fromTag('tr');

  const dn = (text: string, rowspan: number, colspan: number, isNew: boolean) => Structs.detailnew(createCell(text), rowspan, colspan, isNew);
  const r = Structs.rowcells;
  const rd = Structs.rowdetailnew;
  const en = (text: string, isNew: boolean) => Structs.elementnew(createCell(text), isNew, false);
  const enCol = (id: string, isNew: boolean) => Structs.elementnew(createCol(id), isNew, false);

  const rc = (cells: Structs.ElementNew[], section: Structs.Section, isNew: boolean) => {
    const tag = section === 'colgroup' ? 'colgroup' : 'tr';
    return Structs.rowcells(SugarElement.fromTag(tag), cells, section, isNew);
  };

  const tableToGrid = (table: SugarElement<HTMLTableElement>): Structs.RowCells[] => {
    const warehouse = Warehouse.fromTable(table);
    return Transitions.toGrid(warehouse, Bridge.generators, false);
  };

  const checkDetails = (expected: Structs.RowDetailNew<Structs.DetailNew>[], input: Structs.RowCells[]) => {
    const actual = Transitions.toDetails(input, (a, b) => TextContent.get(a) === TextContent.get(b));

    const cleaner = (obj: Structs.RowDetailNew<Structs.DetailNew>[]) => {
      return Arr.map(obj, (row) => {
        return Arr.map(row.cells, (cell) => ({
          ...cell,
          element: TextContent.get(cell.element) ?? '?'
        }));
      });
    };

    assert.deepEqual(cleaner(actual), cleaner(expected));
  };

  const checkGrid = (expectedGrid: Structs.RowCells[], inputTable: SugarElement<HTMLTableElement>) => {
    const actualGrid = tableToGrid(inputTable);

    const cleaner = (grid: Structs.RowCells[]) => {
      return Arr.map(grid, (row) => {
        const cells = Arr.map(row.cells, (cell) => {
          const id = row.section === 'colgroup' ? Attribute.get(cell.element, 'data-id') : TextContent.get(cell.element);
          return {
            ...cell,
            element: id ?? '?'
          };
        });

        return {
          cells,
          section: row.section,
          isNew: row.isNew
        };
      });
    };

    assert.deepEqual(cleaner(actualGrid), cleaner(expectedGrid));
  };

  context('toGrid', () => {
    it('basic table', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <thead>
        <tr><td>one</td><td>two</td></tr>
        </thead>
        <tbody>
        <tr><td>three</td><td>four</td></tr>
        </tbody>
        <tfoot>
        <tr><td>five</td><td>six</td></tr>
        </tfoot>
        </table>`
      );

      checkGrid([
        rc([ en('one', false), en('two', false) ], 'thead', false),
        rc([ en('three', false), en('four', false) ], 'tbody', false),
        rc([ en('five', false), en('six', false) ], 'tfoot', false),
      ], table);
    });

    it('basic colgroup table', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <colgroup><col data-id="1" /><col data-id="2" /></colgroup>
        <thead>
        <tr><td>one</td><td>two</td></tr>
        </thead>
        <tbody>
        <tr><td>three</td><td>four</td></tr>
        </tbody>
        <tfoot>
        <tr><td>five</td><td>six</td></tr>
        </tfoot>
        </table>`
      );

      checkGrid([
        rc([ enCol('1', false), enCol('2', false) ], 'colgroup', false),
        rc([ en('one', false), en('two', false) ], 'thead', false),
        rc([ en('three', false), en('four', false) ], 'tbody', false),
        rc([ en('five', false), en('six', false) ], 'tfoot', false),
      ], table);
    });

    it('basic table with cell spans', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <tbody>
        <tr><td colspan="2">one-two</td></tr>
        <tr><td>three</td><td rowspan="2">four-six</td></tr>
        <tr><td>five</td></tr>
        <tr><td>seven</td><td>eight</td></tr>
        </tbody>
        </table>`
      );

      checkGrid([
        rc([ en('one-two', false), en('one-two', false) ], 'tbody', false),
        rc([ en('three', false), en('four-six', false) ], 'tbody', false),
        rc([ en('five', false), en('four-six', false) ], 'tbody', false),
        rc([ en('seven', false), en('eight', false) ], 'tbody', false),
      ], table);
    });

    it('missing cells in row are added to the grid', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <tbody>
        <tr><td>one</td></tr>
        <tr><td>three</td><td>four</td><td>five</td></tr>
        </tbody>
        </table>`
      );

      checkGrid([
        rc([ en('one', false), en('?', true), en('?', true) ], 'tbody', false),
        rc([ en('three', false), en('four', false), en('five', false) ], 'tbody', false),
      ], table);
    });

    it('TINY-8011: missing cols in colgroup table are added to the grid', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <colgroup><col data-id="1" /></colgroup>
        <tbody>
        <tr><td>one</td><td>two</td><td>three</td></tr>
        <tr><td>four</td><td>five</td><td>six</td></tr>
        </tbody>
        </table>`
      );

      checkGrid([
        rc([ enCol('1', false), enCol('?', true), enCol('?', true) ], 'colgroup', false),
        rc([ en('one', false), en('two', false), en('three', false) ], 'tbody', false),
        rc([ en('four', false), en('five', false), en('six', false) ], 'tbody', false),
      ], table);
    });

    it('TINY-8011: excess cols in colgroup table are not included in the grid', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(
        `<table>
        <colgroup><col data-id="1" /><col data-id="2" /><col data-id="3" /><col data-id="4" /><col data-id="5" /></colgroup>
        <tbody>
        <tr><td>one</td><td>two</td><td>three</td></tr>
        <tr><td>four</td><td>five</td><td>six</td></tr>
        </tbody>
        </table>`
      );

      checkGrid([
        rc([ enCol('1', false), enCol('2', false), enCol('3', false) ], 'colgroup', false),
        rc([ en('one', false), en('two', false), en('three', false) ], 'tbody', false),
        rc([ en('four', false), en('five', false), en('six', false) ], 'tbody', false),
      ], table);
    });
  });

  context('toDetails', () => {
    it('single row tbody table', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'tbody', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'tbody', false)
        ]
      );
    });

    it('single row thead table', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 1, 3, false), dn('td2', 1, 1, false), dn('td3', 1, 1, false) ], 'thead', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td1', false), en('td2', false), en('td3', false) ], 'thead', false)
        ]
      );
    });

    it('single cell tbody table with rowspan and colspan (1)', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 4, 3, false) ], 'tbody', false),
          rd(re(), [], 'tbody', false),
          rd(re(), [], 'tbody', false),
          rd(re(), [], 'tbody', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false)
        ]
      );
    });

    it('single cell tfoot table with rowspan and colspan', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 4, 3, false) ], 'tfoot', false),
          rd(re(), [], 'tfoot', false),
          rd(re(), [], 'tfoot', false),
          rd(re(), [], 'tfoot', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tfoot', false)
        ]
      );
    });

    it('single cell tbody table with rowspan and colspan (2)', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 2, 3, false) ], 'tbody', false),
          rd(re(), [], 'tbody', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td1', false) ], 'tbody', false)
        ]
      );
    });

    it('basic table with thead, tbody and tfoot', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 1, 1, false) ], 'thead', false),
          rd(re(), [ dn('td2', 1, 1, false) ], 'tbody', false),
          rd(re(), [ dn('td3', 1, 1, false) ], 'tfoot', false)
        ],
        [
          r(re(), [ en('td1', false) ], 'thead', false),
          r(re(), [ en('td2', false) ], 'tbody', false),
          r(re(), [ en('td3', false) ], 'tfoot', false)
        ]
      );
    });

    it('complex table 1', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody', false),
          rd(re(), [ dn('td4', 1, 1, false) ], 'tbody', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td3', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td4', false) ], 'tbody', false)
        ]
      );
    });

    it('complex table 2', () => {
      checkDetails(
        [
          rd(re(), [ dn('td1', 2, 2, false), dn('td3', 1, 1, false) ], 'tbody', false),
          rd(re(), [ dn('td4', 2, 1, false) ], 'tbody', false),
          rd(re(), [ dn('td2', 1, 2, false) ], 'tbody', false),
          rd(re(), [ dn('td5', 1, 1, false), dn('td6', 1, 2, false) ], 'tbody', false)
        ],
        [
          r(re(), [ en('td1', false), en('td1', false), en('td3', false) ], 'tbody', false),
          r(re(), [ en('td1', false), en('td1', false), en('td4', false) ], 'tbody', false),
          r(re(), [ en('td2', false), en('td2', false), en('td4', false) ], 'tbody', false),
          r(re(), [ en('td5', false), en('td6', false), en('td6', false) ], 'tbody', false)
        ]
      );
    });
  });
});
