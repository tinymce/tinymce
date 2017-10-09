asynctest(
  'browser.tinymce.core.delete.TableDeleteActionTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Html',
    'global!document',
    'tinymce.core.delete.TableDeleteAction'
  ],

  function (Assertions, Chain, Logger, Pipeline, Arr, Fun, Result, Hierarchy, Element, Node, Html, document, TableDeleteAction) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cFromHtml = function (html, startPath, startOffset, endPath, endOffset) {
      return Chain.mapper(function () {
        var elm = Element.fromHtml(html);
        var sc = Hierarchy.follow(elm, startPath).getOrDie();
        var ec = Hierarchy.follow(elm, endPath).getOrDie();
        var rng = document.createRange();

        rng.setStart(sc.dom(), startOffset);
        rng.setEnd(ec.dom(), endOffset);

        return TableDeleteAction.getActionFromRange(elm, rng);
      });
    };

    var fail = function (message) {
      return Fun.constant(Result.error(message));
    };

    var cAssertNone = Chain.op(function (x) {
      Assertions.assertEq('Is none', true, x.isNone());
    });

    var cExtractActionCells = Chain.binder(function (actionOpt) {
      return actionOpt
          .fold(
            fail('unexpected nothing'),
            function (action) {
              return action.fold(
                fail('unexpected action'),
                function (xs) {
                  var cellString = Arr.map(xs, Html.getOuter).join('');

                  return Result.value(cellString);
                }
              );
            }
          );
    });

    var cExtractTableFromDeleteAction = Chain.binder(function (actionOpt) {
      return actionOpt
        .fold(
          fail('unexpected nothing'),
          function (action) {
            return action.fold(
              function (table) {
                return Result.value(Html.getOuter(table));
              },
              fail('unexpected action')
            );
          }
        );
    });

    Pipeline.async({}, [
      Logger.t('collapsed range should return none', Chain.asStep({}, [
        cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [0, 0, 0, 0], 0, [0, 0, 0, 0], 0),
        cAssertNone
      ])),

      Logger.t('select two out of three cells returns the emptycells action', Chain.asStep({}, [
        cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [0, 0, 0, 0], 0, [0, 0, 1, 0], 1),
        cExtractActionCells,
        Assertions.cAssertEq('Should be cells', '<td>a</td><td>b</td>')
      ])),

      Logger.t('select two out of three cells returns the emptycells action', Chain.asStep({}, [
        cFromHtml('<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr></tbody></table>', [0, 0, 0, 0], 0, [0, 0, 1, 0], 1),
        cExtractActionCells,
        Assertions.cAssertEq('Should be cells', '<th>a</th><th>b</th>')
      ])),

      Logger.t('select three out of three cells returns the removeTable action', Chain.asStep({}, [
        cFromHtml('<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>', [0, 0, 0, 0], 0, [0, 0, 2, 0], 1),
        cExtractTableFromDeleteAction,
        Assertions.cAssertEq('should be table', '<table><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody></table>')
      ])),

      Logger.t('select between rows, not all cells', Chain.asStep({}, [
        cFromHtml(
          '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
          [0, 0, 1, 0], 0, [0, 1, 0, 0], 1
        ),
        cExtractActionCells,
        Assertions.cAssertEq('should be cells', '<th>b</th><th>c</th><td>d</td>')
      ])),


      Logger.t('select between rows, all cells', Chain.asStep({}, [
        cFromHtml(
          '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>',
          [0, 0, 0, 0], 0, [0, 1, 2, 0], 1
        ),
        cExtractTableFromDeleteAction,
        Assertions.cAssertEq('should be table', '<table><tbody><tr><th>a</th><th>b</th><th>c</th></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table>')
      ]))
    ], function () {
      success();
    }, failure);
  }
);
