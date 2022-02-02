import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as TableDeleteAction from 'tinymce/core/delete/TableDeleteAction';

describe('browser.tinymce.core.delete.TableDeleteActionTest', () => {

  const fromHtml = (html: string, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const elm = SugarElement.fromHtml(html);
    const sc = Hierarchy.follow(elm, startPath).getOrDie();
    const ec = Hierarchy.follow(elm, endPath).getOrDie();
    const rng = document.createRange();

    rng.setStart(sc.dom, startOffset);
    rng.setEnd(ec.dom, endOffset);

    return TableDeleteAction.getActionFromRange(elm, rng);
  };

  const fail = (message: string) => () => assert.fail(message);

  const assertNone = (x: Optional<unknown>) => {
    assert.isTrue(x.isNone(), 'Is none');
  };

  const extractSingleCellTableAction = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => action.fold(
        (_rng, cell) => Html.getOuter(cell),
        fail('unexpected action'),
        fail('unexpected action'),
        fail('unexpected action')
      )
    );
  };

  const extractFullTableAction = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => {
        return action.fold(
          fail('unexpected action'),
          (table) => Html.getOuter(table),
          fail('unexpected action'),
          fail('unexpected action')
        );
      }
    );
  };

  const extractPartialTableAction = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => {
        return action.fold(
          fail('unexpected action'),
          fail('unexpected action'),
          (cells, outsideDetails) => ({
            cells: Arr.map(cells, Html.getOuter).join(''),
            otherContent: outsideDetails.map(({ rng }) => rng.extractContents().textContent).getOr(''),
            details: outsideDetails
          }),
          fail('unexpected action')
        );
      }
    );
  };

  const extractMultiTableAction = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => {
        return action.fold(
          fail('unexpected action'),
          fail('unexpected action'),
          fail('unexpected action'),
          (startTableCells, endTableCells, betweenRng) => ({
            startCells: Arr.map(startTableCells, Html.getOuter).join(''),
            endCells: Arr.map(endTableCells, Html.getOuter).join(''),
            otherContent: betweenRng.extractContents().textContent
          })
        );
      }
    );
  };

  it('collapsed range should return none', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0);
    assertNone(action);
  });

  it('select two out of three cells returns the partialTable action', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
    const { cells, otherContent, details } = extractPartialTableAction(action);
    assert.equal(cells, '<td>a</td><td>b</td>', 'Should be cells');
    assert.isEmpty(otherContent);
    assert.isTrue(details.isNone(), 'No outside details');
  });

  it('select two out of three header cells returns the partialTable action', () => {
    const action = fromHtml('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
    const { cells, otherContent, details } = extractPartialTableAction(action);
    assert.equal(cells, '<th>a</th><th>b</th>', 'Should be cells');
    assert.isEmpty(otherContent);
    assert.isTrue(details.isNone(), 'No outside details');
  });

  it('select three out of three cells returns the fullTable action', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 2, 0 ], 1);
    const table = extractFullTableAction(action);
    assert.equal(table, '<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', 'should be table');
  });

  it('select between rows, not all cells', () => {
    const action = fromHtml(
      '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
      [ 0, 0, 1, 0 ], 0, [ 0, 1, 0, 0 ], 1
    );
    const { cells, otherContent, details } = extractPartialTableAction(action);
    assert.equal(cells, '<th>b</th><th>c</th><td>d</td>', 'should be cells');
    assert.isEmpty(otherContent);
    assert.isTrue(details.isNone(), 'No outside details');
  });

  it('select between rows, all cells', () => {
    const action = fromHtml(
      '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
      [ 0, 0, 0, 0 ], 0, [ 0, 1, 2, 0 ], 1
    );
    const table = extractFullTableAction(action);
    assert.equal(table, '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>', 'should be table');
  });

  it('TINY-6044: select between two tables, not all cells', () => {
    const action = fromHtml(
      '<div>' +
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>' +
      'foo' +
      '<table><tbody><tr><td>e</td></tr><tr><td>f</td></tr></tbody></table>' +
      '</div>',
      [ 0, 0, 0, 1, 0 ], 0, [ 2, 0, 0, 0, 0 ], 1
    );
    const { startCells, endCells, otherContent } = extractMultiTableAction(action);
    assert.equal(startCells, '<td>b</td><td>c</td><td>d</td>');
    assert.equal(endCells, '<td>e</td>');
    assert.equal(otherContent, 'foo');
  });

  it('TINY-6044: select between two tables, all cells', () => {
    const action = fromHtml(
      '<div>' +
      '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>' +
      'foo' +
      '<table><tbody><tr><td>c</td></tr><tr><td>d</td></tr></tbody></table>' +
      '</div>',
      [ 0, 0, 0, 0, 0 ], 0, [ 2, 0, 1, 0, 0 ], 1
    );
    const { startCells, endCells, otherContent } = extractMultiTableAction(action);
    assert.equal(startCells, '<td>a</td><td>b</td>');
    assert.equal(endCells, '<td>c</td><td>d</td>');
    assert.equal(otherContent, 'foo');
  });

  it('select table and content after', () => {
    const action = fromHtml(
      '<div><table><tbody><tr><td>a</td></tr></tbody></table>b</div>',
      [ 0, 0, 0, 0, 0 ], 0, [ 1 ], 1
    );
    const { cells, otherContent, details } = extractPartialTableAction(action);
    assert.equal(cells, '<td>a</td>', 'should be cells from partially selected table');
    assert.equal(otherContent, 'b');
    assert.isTrue(details.isSome(), 'Has outside details');
  });

  it('select table and content before', () => {
    const action = fromHtml(
      '<div>a<table><tbody><tr><td>b</td></tr></tbody></table></div>',
      [ 0 ], 0, [ 1, 0, 0, 0, 0 ], 1
    );
    const { cells, otherContent, details } = extractPartialTableAction(action);
    assert.equal(cells, '<td>b</td>', 'should be cells from partially selected table');
    assert.equal(otherContent, 'a');
    assert.isTrue(details.isSome(), 'Has outside details');
  });

  it('single cell table with all content selected', () => {
    const action = fromHtml(
      '<table><tbody><tr><td>test</td></tr></tbody></table>',
      [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 4
    );
    const cell = extractSingleCellTableAction(action);
    assert.equal(cell, '<td>test</td>', 'Should be cells');
  });
});
