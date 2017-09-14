asynctest(
  'browser.tinymce.core.selection.SimpleTableModel',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'tinymce.core.selection.SimpleTableModel'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Fun, Result, Hierarchy, Insert, Element, Html, SimpleTableModel) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cFromDom = function (html) {
      return Chain.mapper(function (_) {
        return SimpleTableModel.fromDom(Element.fromHtml(html));
      });
    };

    var cFromDomSubSection = function (html, startPath, endPath) {
      return Chain.binder(function (_) {
        var tableElm = Element.fromHtml(html);
        var startElm = Hierarchy.follow(tableElm, startPath).getOrDie();
        var endElm = Hierarchy.follow(tableElm, endPath).getOrDie();
        return SimpleTableModel.subsection(SimpleTableModel.fromDom(tableElm), startElm, endElm).fold(
          Fun.constant(Result.error('Failed to get the subsection')),
          Result.value
        );
      });
    };

    var cAssertWidth = function (expectedWidth) {
      return Chain.op(function (tableModel) {
        Assertions.assertEq('Should be expected width', expectedWidth, tableModel.width());
      });
    };

    var cAssertHeight = function (expectedWidth) {
      return Chain.op(function (tableModel) {
        Assertions.assertEq('Should be expected height', expectedWidth, tableModel.rows().length);
      });
    };

    var cAssertModelAsHtml = function (expectedHtml) {
      return Chain.op(function (tableModel) {
        var actualHtml = Html.getOuter(SimpleTableModel.toDom(tableModel));
        Assertions.assertHtml('Should be expected table html', expectedHtml, actualHtml);
      });
    };

    Pipeline.async({}, [
      Logger.t('fromDom/toDom', GeneralSteps.sequence([
        Logger.t('Table 1x1', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td>A</td></tr></tbody></table>'),
          cAssertWidth(1),
          cAssertHeight(1),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr></tbody></table>')
        ])),
        Logger.t('Table 1x1 with classes', Chain.asStep({}, [
          cFromDom('<table class="a"><tbody><tr class="b"><td class="c">A</td></tr></tbody></table>'),
          cAssertWidth(1),
          cAssertHeight(1),
          cAssertModelAsHtml('<table class="a"><tbody><tr class="b"><td class="c">A</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x1', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>'),
          cAssertWidth(2),
          cAssertHeight(1),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
          cAssertWidth(2),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 with colspan', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td colspan="2">A</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
          cAssertWidth(2),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td></td></tr><tr><td>C</td><td>D</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 with rowspan', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>D</td></tr></tbody></table>'),
          cAssertWidth(2),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td></td><td>D</td></tr></tbody></table>')
        ])),
        Logger.t('Table 3x3 with colspan & rowspan', Chain.asStep({}, [
          cFromDom('<table><tbody><tr><td colspan="2" rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr></tbody></table>'),
          cAssertWidth(3),
          cAssertHeight(3),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td></td><td>B</td></tr><tr><td></td><td></td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr></tbody></table>')
        ]))
      ])),
      Logger.t('subsection', GeneralSteps.sequence([
        Logger.t('Table 1x1 subsection (1,1)-(1,1)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td></tr></tbody></table>', [0, 0, 0], [0, 0, 0]),
          cAssertWidth(1),
          cAssertHeight(1),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 subsection (1,1)-(2,1)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [0, 0, 0], [0, 0, 1]),
          cAssertWidth(2),
          cAssertHeight(1),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 subsection (2,1)-(1,1)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [0, 0, 1], [0, 0, 0]),
          cAssertWidth(2),
          cAssertHeight(1),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 subsection (1,1)-(1,2)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [0, 0, 0], [0, 1, 0]),
          cAssertWidth(1),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>')
        ])),
        Logger.t('Table 2x2 subsection (1,2)-(1,1)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [0, 1, 0], [0, 0, 0]),
          cAssertWidth(1),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>')
        ])),
        Logger.t('Table 3x3 subsection (2,2)-(3,3)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [0, 1, 1], [0, 2, 2]),
          cAssertWidth(2),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>')
        ])),
        Logger.t('Table 3x3 subsection (3,3)-(2,2)', Chain.asStep({}, [
          cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [0, 2, 2], [0, 1, 1]),
          cAssertWidth(2),
          cAssertHeight(2),
          cAssertModelAsHtml('<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>')
        ]))
      ]))
    ], function () {
      success();
    }, failure);
  }
);