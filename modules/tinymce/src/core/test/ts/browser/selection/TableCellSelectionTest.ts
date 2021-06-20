import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as TableCellSelection from 'tinymce/core/selection/TableCellSelection';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.TableCellSelectionTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const getCellsFromElement = (element: Element) => {
    return TableCellSelection.getCellsFromElement(SugarElement.fromDom(element));
  };

  const getCellsFromRanges = (paths: number[][]) => {
    const ranges = Arr.map(paths, (path) => {
      const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
      const rng = document.createRange();
      rng.selectNode(container.dom);
      return rng;
    });

    return TableCellSelection.getCellsFromRanges(ranges);
  };

  const assertCellContents = (cells: SugarElement<HTMLTableCellElement>[], expectedContents: string[]) => {
    const actualContents = Arr.map(cells, Html.get);
    assert.deepEqual(actualContents, expectedContents, 'Should be expected cell contents');
  };

  it('Get table cells from fake selection', () => {
    setHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>');
    const cells = getCellsFromElement(viewBlock.get());
    assertCellContents(cells, [ 'A', 'C' ]);
  });

  it('Get table cells from ranges', () => {
    setHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
    const cells = getCellsFromRanges([[ 0, 0, 0, 1 ], [ 0, 0, 1, 1 ]]);
    assertCellContents(cells, [ 'B', 'D' ]);
  });
});
