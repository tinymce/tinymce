import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import * as TableCellSelection from 'tinymce/core/selection/TableCellSelection';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.selection.TableCellSelectionTest', (success, failure) => {
  const viewBlock = ViewBlock();

  const cSetHtml = (html) => {
    return Chain.op(() => {
      viewBlock.update(html);
    });
  };

  const cGetCellsFromElement = Chain.mapper((viewBlock: any) => {
    return TableCellSelection.getCellsFromElement(SugarElement.fromDom(viewBlock.get()));
  });

  const cGetCellsFromRanges = (paths) => {
    return Chain.mapper((viewBlock: any) => {
      const ranges = Arr.map(paths, (path) => {
        const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
        const rng = document.createRange();
        rng.selectNode(container.dom);
        return rng;
      });

      return TableCellSelection.getCellsFromRanges(ranges);
    });
  };

  const cAssertCellContents = (expectedContents) => {
    return Chain.op((cells: SugarElement[]) => {
      const actualContents = Arr.map(cells, Html.get);
      Assertions.assertEq('Should be expected cell contents', expectedContents, actualContents);
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Get table cells from fake selection', Chain.asStep(viewBlock, [
      cSetHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>'),
      cGetCellsFromElement,
      cAssertCellContents([ 'A', 'C' ])
    ])),
    Logger.t('Get table cells from ranges', Chain.asStep(viewBlock, [
      cSetHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
      cGetCellsFromRanges([[ 0, 0, 0, 1 ], [ 0, 0, 1, 1 ]]),
      cAssertCellContents([ 'B', 'D' ])
    ]))
  ], () => {
    viewBlock.detach();
    success();
  }, failure);
});
