import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Type from 'ephox/snooker/lookup/Type';

describe('browser.snooker.lookup.TypeTest', () => {
  const container = SugarElement.fromTag('div');

  const assertWithWarehouse = (assertions: (warehouse: Warehouse, table: SugarElement<HTMLTableElement>) => void) => {
    const table = UiFinder.findIn<HTMLTableElement>(container, 'table').getOrDie();
    const warehouse = Warehouse.fromTable(table);
    assertions(warehouse, table);
  };

  context('findCommonCellType', () => {
    const assertCommonCellType = (expectedType: string) => assertWithWarehouse((warehouse) => {
      const cells = Arr.bind(warehouse.all, (row) => row.cells);
      const cellType = Type.findCommonCellType(cells).getOr('');
      assert.equal(cellType, expectedType);
    });

    it('TINY-6666: No header cells', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonCellType('td');
    });

    it('TINY-6666: All header cells', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<th>text</th>' +
        '<th>text</th>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonCellType('th');
    });

    it('TINY-6666: Mixed cells', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr>' +
        '<th>text</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonCellType('');
    });
  });

  context('findCommonRowType', () => {
    const assertCommonRowType = (expectedType: string) => assertWithWarehouse((warehouse) => {
      const rowType = Type.findCommonRowType(warehouse.all).getOr('');
      assert.equal(rowType, expectedType);
    });

    const assertRowTypes = (expectedTypes: string[]) => assertWithWarehouse((warehouse) => {
      const rowTypes = Arr.map(warehouse.all, (row) =>
        Type.findCommonRowType([ row ]).getOrDie('Unable to find row type')
      );
      assert.deepEqual(rowTypes, expectedTypes);
    });

    it('TINY-6007: No header rows', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonRowType('body');
    });

    it('TINY-6007: tbody > tr > th is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<th>text</th>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonRowType('header');
    });

    it('TINY-6007: tbody > tr > ths is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<th>text</th>' +
        '<th>more text</th>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonRowType('header');
    });

    it('TINY-6007: tbody > tr > td+th is detected correctly as NOT a header row', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '<th>more text</th>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertCommonRowType('body');
    });

    it('TINY-6007: thead > tr > td is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr class="foo">' +
        '<td>text</td>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowTypes([ 'header', 'body' ]);
      assertCommonRowType('');
    });

    it('TINY-6007: thead > tr > th is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr class="foo">' +
        '<th>text</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowTypes([ 'header', 'body' ]);
      assertCommonRowType('');
    });

    it('TINY-6007: thead > tr > ths is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr class="foo">' +
        '<th>text</th>' +
        '<th>more text</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowTypes([ 'header', 'body' ]);
      assertCommonRowType('');
    });

    it('TINY-6007: thead > tr > td+th is detected correctly as a header row', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr class="foo">' +
        '<td>text</td>' +
        '<th>more text</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '<tfoot><tr>' +
        '<td>text</td>' +
        '</tr></tfoot>' +
        '</table>'
      );
      assertRowTypes([ 'header', 'body', 'footer' ]);
      assertCommonRowType('');
    });

    it('TINY-8104: tfoot > tr > th is detected correctly as a footer row', () => {
      Html.set(container,
        '<table>' +
        '<tfoot>' +
        '<tr class="foo">' +
        '<th>text</th>' +
        '</tr>' +
        '</tfoot>' +
        '</table>'
      );
      assertRowTypes([ 'footer' ]);
      assertCommonRowType('footer');
    });

  });

  context('findTableRowHeaderType', () => {
    const assertRowHeaderType = (expectedType: string) => assertWithWarehouse((warehouse) => {
      const rowType = Type.findTableRowHeaderType(warehouse).getOr('');
      assert.equal(rowType, expectedType);
    });

    it('TINY-6007: No header rows ', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowHeaderType('');
    });

    it('TINY-6007: tbody > tr > th is detected correctly as a cells type', () => {
      Html.set(container,
        '<table>' +
        '<tbody><tr>' +
        '<th>text</th>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowHeaderType('cells');
    });

    it('TINY-6007: thead > tr > th is detected correctly as a sectionCells type', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr>' +
        '<th>text</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowHeaderType('sectionCells');
    });

    it('TINY-6007: thead > tr > td is detected correctly as a section type', () => {
      Html.set(container,
        '<table>' +
        '<thead><tr>' +
        '<td>text</td>' +
        '</tr></thead>' +
        '<tbody><tr>' +
        '<td>text</td>' +
        '</tr></tbody>' +
        '</table>'
      );
      assertRowHeaderType('section');
    });
  });
});
