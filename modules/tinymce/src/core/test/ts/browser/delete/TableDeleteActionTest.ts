import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Option, Result } from '@ephox/katamari';
import { Element, Hierarchy, Html } from '@ephox/sugar';
import * as TableDeleteAction from 'tinymce/core/delete/TableDeleteAction';

UnitTest.asynctest('browser.tinymce.core.delete.TableDeleteActionTest', function (success, failure) {

  const cFromHtml = (html, startPath, startOffset, endPath, endOffset) =>
    Chain.injectThunked(() => {
      const elm = Element.fromHtml(html);
      const sc = Hierarchy.follow(elm, startPath).getOrDie();
      const ec = Hierarchy.follow(elm, endPath).getOrDie();
      const rng = document.createRange();

      rng.setStart(sc.dom(), startOffset);
      rng.setEnd(ec.dom(), endOffset);

      return TableDeleteAction.getActionFromRange(elm, rng);
    });

  const fail = (message: string) => Fun.constant(Result.error(message));

  const cAssertNone = Chain.op(function (x: Option<any>) {
    Assertions.assertEq('Is none', true, x.isNone());
  });

  const cExtractActionCells = Chain.binder(function (actionOpt: Option<any>) {
    return actionOpt
      .fold(
        fail('unexpected nothing'),
        function (action) {
          return action.fold(
            fail('unexpected action'),
            function (xs) {
              const cellString = Arr.map(xs, Html.getOuter).join('');

              return Result.value(cellString);
            },
            fail('unexpected action')
          );
        }
      );
  });

  const cExtractDeleteSelectionCell = Chain.binder(function (actionOpt: Option<any>) {
    return actionOpt
      .fold(
        fail('unexpected nothing'),
        (action) => action.fold(
          fail('unexpected action'),
          fail('unexpected action'),
          (rng, cell) => Result.value(Html.getOuter(cell))
        )
      );
  });

  const cExtractTableFromDeleteAction = Chain.binder(function (actionOpt: Option<any>) {
    return actionOpt
      .fold(
        fail('unexpected nothing'),
        function (action) {
          return action.fold(
            function (table) {
              return Result.value(Html.getOuter(table));
            },
            fail('unexpected action'),
            fail('unexpected action')
          );
        }
      );
  });

  Pipeline.async({}, [
    Logger.t('collapsed range should return none', Chain.asStep({}, [
      cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0),
      cAssertNone
    ])),

    Logger.t('select two out of three cells returns the emptycells action', Chain.asStep({}, [
      cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1),
      cExtractActionCells,
      Assertions.cAssertEq('Should be cells', '<td>a</td><td>b</td>')
    ])),

    Logger.t('select two out of three cells returns the emptycells action', Chain.asStep({}, [
      cFromHtml('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1),
      cExtractActionCells,
      Assertions.cAssertEq('Should be cells', '<th>a</th><th>b</th>')
    ])),

    Logger.t('select three out of three cells returns the removeTable action', Chain.asStep({}, [
      cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 2, 0 ], 1),
      cExtractTableFromDeleteAction,
      Assertions.cAssertEq('should be table', '<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>')
    ])),

    Logger.t('select between rows, not all cells', Chain.asStep({}, [
      cFromHtml(
        '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
        [ 0, 0, 1, 0 ], 0, [ 0, 1, 0, 0 ], 1
      ),
      cExtractActionCells,
      Assertions.cAssertEq('should be cells', '<th>b</th><th>c</th><td>d</td>')
    ])),

    Logger.t('select between rows, all cells', Chain.asStep({}, [
      cFromHtml(
        '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
        [ 0, 0, 0, 0 ], 0, [ 0, 1, 2, 0 ], 1
      ),
      cExtractTableFromDeleteAction,
      Assertions.cAssertEq('should be table', '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>')
    ])),

    Logger.t('select between two tables', Chain.asStep({}, [
      cFromHtml(
        '<div><table><tbody><tr><td>a</td></tr></tbody></table><table><tbody><tr><td>b</td></tr></tbody></table></div>',
        [ 0, 0, 0, 0, 0 ], 0, [ 1, 0, 0, 0, 0 ], 1,
      ),
      cExtractTableFromDeleteAction,
      Assertions.cAssertEq('should be cell from first table only', '<table><tbody><tr><td>a</td></tr></tbody></table>')
    ])),

    Logger.t('select between two tables', Chain.asStep({}, [
      cFromHtml(
        '<div><table><tbody><tr><td>a</td></tr></tbody></table>b',
        [ 0, 0, 0, 0, 0 ], 0, [ 1 ], 1,
      ),
      cExtractTableFromDeleteAction,
      Assertions.cAssertEq('should cells from partially selected table', '<table><tbody><tr><td>a</td></tr></tbody></table>')
    ])),

    Logger.t('select between two tables', Chain.asStep({}, [
      cFromHtml(
        '<div>a<table><tbody><tr><td>b</td></tr></tbody></table>',
        [ 0 ], 0, [ 1, 0, 0, 0, 0 ], 1,
      ),
      cExtractTableFromDeleteAction,
      Assertions.cAssertEq('should cells from partially selected table', '<table><tbody><tr><td>b</td></tr></tbody></table>')
    ])),

    Logger.t('single cell table with all content selected', Chain.asStep({}, [
      cFromHtml(
        '<table><tbody><tr><td>test</td></tr></tbody></table>',
        [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 4,
      ),
      cExtractDeleteSelectionCell,
      Assertions.cAssertEq('Should be cells', '<td>test</td>')
    ]))
  ], success, failure);
});
