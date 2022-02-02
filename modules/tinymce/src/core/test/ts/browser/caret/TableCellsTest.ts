import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SelectorFind, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import * as TableCells from 'tinymce/core/caret/TableCells';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.caret.TableCellsTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = (html: string) => viewBlock.update(html.trim());

  const assertCell = (cellOpt: Optional<HTMLTableCellElement | HTMLTableCaptionElement>, path: number[]) => {
    const cell = cellOpt.getOrDie('x');
    const expectedContainer = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    Assertions.assertDomEq('Should be the expected element', expectedContainer, SugarElement.fromDom(cell));
  };

  const assertNone = (opt: Optional<HTMLTableCellElement | HTMLTableCaptionElement>) => {
    assert.isTrue(opt.isNone(), 'Should be the none but got some');
  };

  const getClosestCellAbove = (x: number, y: number) => {
    const table = SelectorFind.descendant<HTMLTableElement>(SugarElement.fromDom(viewBlock.get()), 'table').getOrDie('Could not find table').dom;
    const rect = table.getBoundingClientRect();
    return TableCells.getClosestCellAbove(table, rect.left + x, rect.top + y);
  };

  const getClosestCellBelow = (x: number, y: number) => {
    const table = SelectorFind.descendant<HTMLTableElement>(SugarElement.fromDom(viewBlock.get()), 'table').getOrDie('Could not find table').dom;
    const rect = table.getBoundingClientRect();
    return TableCells.getClosestCellBelow(table, rect.left + x, rect.top + y);
  };

  const findClosestPositionInAboveCell = (path: number[], offset: number) => {
    const table = SelectorFind.descendant<HTMLTableElement>(SugarElement.fromDom(viewBlock.get()), 'table').getOrDie('Could not find table').dom;
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return TableCells.findClosestPositionInAboveCell(table, pos);
  };

  const findClosestPositionInBelowCell = (path: number[], offset: number) => {
    const table = SelectorFind.descendant<HTMLTableElement>(SugarElement.fromDom(viewBlock.get()), 'table').getOrDie('Could not find table').dom;
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return TableCells.findClosestPositionInBelowCell(table, pos);
  };

  const assertCaretPosition = (posOpt: Optional<CaretPosition>, path: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
    const pos = posOpt.getOrDie('Needs to return a caret');

    Assertions.assertDomEq('Should be the expected container', container, SugarElement.fromDom(pos.container()));
    assert.equal(pos.offset(), offset, 'Should be the expected offset');
  };

  context('getClosestCellAbove', () => {
    it('Should return the top/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellAbove(30, 30);
      assertCell(cell, [ 0, 0, 0, 1 ]);
    });
    it('Should return the top/left cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellAbove(15, 30);
      assertCell(cell, [ 0, 0, 0, 0 ]);
    });
    it('Should not return a cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellAbove(15, 15);
      assertNone(cell);
    });
  });

  context('getClosestCellBelow', () => {
    it('Should return the bottom/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellBelow(30, 15);
      assertCell(cell, [ 0, 0, 1, 1 ]);
    });
    it('Should return the bottom/left cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellBelow(15, 15);
      assertCell(cell, [ 0, 0, 1, 0 ]);
    });
    it('Should not return a cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const cell = getClosestCellBelow(30, 30);
      assertNone(cell);
    });
  });

  context('findClosestPositionInAboveCell', () => {
    it('Should return first positon in the top/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const pos = findClosestPositionInAboveCell([ 0, 0, 1, 1 ], 0);
      assertCaretPosition(pos, [ 0, 0, 0, 1, 0 ], 0);
    });
    it('Should return last positon in the top/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const pos = findClosestPositionInAboveCell([ 0, 0, 1, 1 ], 1);
      assertCaretPosition(pos, [ 0, 0, 0, 1, 0 ], 1);
    });
    it('Should return first positon in the bottom/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const pos = findClosestPositionInBelowCell([ 0, 0, 0, 1 ], 0);
      assertCaretPosition(pos, [ 0, 0, 1, 1, 0 ], 0);
    });
    it('Should return last positon in the bottom/right cell', () => {
      setHtml([
        '<table style="border-collapse: collapse" border="1">',
        '<tbody>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">a</td>',
        '<td style="width: 20px; height: 20px;">b</td>',
        '</tr>',
        '<tr>',
        '<td style="width: 20px; height: 20px;">c</td>',
        '<td style="width: 20px; height: 20px;">d</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join(''));
      const pos = findClosestPositionInBelowCell([ 0, 0, 0, 1 ], 1);
      assertCaretPosition(pos, [ 0, 0, 1, 1, 0 ], 1);
    });
  });
});
