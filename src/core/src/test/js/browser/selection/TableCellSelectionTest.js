asynctest(
  'browser.tinymce.core.selection.TableCellSelectionTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'global!document',
    'tinymce.core.selection.FragmentReader',
    'tinymce.core.selection.TableCellSelection',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Arr, Fun, Hierarchy, Insert, Element, Html, document, FragmentReader, TableCellSelection, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cGetCellsFromElement = Chain.mapper(function (viewBlock) {
      return TableCellSelection.getCellsFromElement(Element.fromDom(viewBlock.get()));
    });

    var cGetCellsFromRanges = function (paths) {
      return Chain.mapper(function (viewBlock) {
        var ranges = Arr.map(paths, function (path) {
          var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
          var rng = document.createRange();
          rng.selectNode(container.dom());
          return rng;
        });

        return TableCellSelection.getCellsFromRanges(ranges);
      });
    };

    var cAssertCellContents = function (expectedContents) {
      return Chain.op(function (cells) {
        var actualContents = Arr.map(cells, Html.get);
        Assertions.assertEq('Should be expected cell contents', expectedContents, actualContents);
      });
    };

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Get table cells from fake selection', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>'),
        cGetCellsFromElement,
        cAssertCellContents(['A', 'C'])
      ])),
      Logger.t('Get table cells from ranges', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
        cGetCellsFromRanges([[0, 0, 0, 1], [0, 0, 1, 1]]),
        cAssertCellContents(['B', 'D'])
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);