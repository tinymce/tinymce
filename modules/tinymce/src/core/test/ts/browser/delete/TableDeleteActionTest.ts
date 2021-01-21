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

  const extractActionCells = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => {
        return action.fold(
          fail('unexpected action'),
          (xs) => Arr.map(xs, Html.getOuter).join(''),
          fail('unexpected action')
        );
      }
    );
  };

  const extractDeleteSelectionCell = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => action.fold(
        fail('unexpected action'),
        fail('unexpected action'),
        (rng, cell) => Html.getOuter(cell)
      )
    );
  };

  const extractTableFromDeleteAction = (actionOpt: Optional<TableDeleteAction.DeleteActionAdt>) => {
    return actionOpt.fold(
      fail('unexpected nothing'),
      (action) => {
        return action.fold(
          (table) => Html.getOuter(table),
          fail('unexpected action'),
          fail('unexpected action')
        );
      }
    );
  };

  it('collapsed range should return none', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0);
    assertNone(action);
  });

  it('select two out of three cells returns the emptycells action', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
    const cells = extractActionCells(action);
    assert.equal(cells, '<td>a</td><td>b</td>', 'Should be cells');
  });

  it('select two out of three header cells returns the emptycells action', () => {
    const action = fromHtml('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
    const cells = extractActionCells(action);
    assert.equal(cells, '<th>a</th><th>b</th>', 'Should be cells');
  });

  it('select three out of three cells returns the removeTable action', () => {
    const action = fromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 2, 0 ], 1);
    const table = extractTableFromDeleteAction(action);
    assert.equal(table, '<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', 'should be table');
  });

  it('select between rows, not all cells', () => {
    const action = fromHtml(
      '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
      [ 0, 0, 1, 0 ], 0, [ 0, 1, 0, 0 ], 1
    );
    const cells = extractActionCells(action);
    assert.equal(cells, '<th>b</th><th>c</th><td>d</td>', 'should be cells');
  });

  it('select between rows, all cells', () => {
    const action = fromHtml(
      '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
      [ 0, 0, 0, 0 ], 0, [ 0, 1, 2, 0 ], 1
    );
    const table = extractTableFromDeleteAction(action);
    assert.equal(table, '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>', 'should be table');
  });

  it('select between two tables', () => {
    const action = fromHtml(
      '<div><table><tbody><tr><td>a</td></tr></tbody></table><table><tbody><tr><td>b</td></tr></tbody></table></div>',
      [ 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 1
    );
    const table = extractTableFromDeleteAction(action);
    assert.equal(table, '<table><tbody><tr><td>a</td></tr></tbody></table>', 'should be cell from first table only');
  });

  it('select between table and content after', () => {
    const action = fromHtml(
      '<div><table><tbody><tr><td>a</td></tr></tbody></table>b',
      [ 0, 0, 0, 0, 0 ], 0, [ 1 ], 1
    );
    const table = extractTableFromDeleteAction(action);
    assert.equal(table, '<table><tbody><tr><td>a</td></tr></tbody></table>', 'should be cells from partially selected table');
  });

  it('select between table and content before', () => {
    const action = fromHtml(
      '<div>a<table><tbody><tr><td>b</td></tr></tbody></table>',
      [ 0 ], 0, [ 1, 0, 0, 0, 0 ], 1
    );
    const table = extractTableFromDeleteAction(action);
    assert.equal(table, '<table><tbody><tr><td>b</td></tr></tbody></table>', 'should be cells from partially selected table');
  });

  it('single cell table with all content selected', () => {
    const action = fromHtml(
      '<table><tbody><tr><td>test</td></tr></tbody></table>',
      [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 4
    );
    const cell = extractDeleteSelectionCell(action);
    assert.equal(cell, '<td>test</td>', 'Should be cells');
  });
});
