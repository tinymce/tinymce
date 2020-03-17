import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { Fun, Result } from '@ephox/katamari';
import { Hierarchy, Element, Html } from '@ephox/sugar';
import * as SimpleTableModel from 'tinymce/core/selection/SimpleTableModel';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.selection.SimpleTableModel', function (success, failure) {

  const cFromDom = function (html) {
    return Chain.injectThunked(function () {
      return SimpleTableModel.fromDom(Element.fromHtml(html));
    });
  };

  const cFromDomSubSection = function (html, startPath, endPath) {
    return Chain.binder(function (_) {
      const tableElm = Element.fromHtml(html);
      const startElm = Hierarchy.follow(tableElm, startPath).getOrDie();
      const endElm = Hierarchy.follow(tableElm, endPath).getOrDie();
      return SimpleTableModel.subsection(SimpleTableModel.fromDom(tableElm), startElm, endElm).fold(
        Fun.constant(Result.error('Failed to get the subsection')),
        Result.value
      );
    });
  };

  const cAssertWidth = function (expectedWidth) {
    return Chain.op(function (tableModel: any) {
      Assertions.assertEq('Should be expected width', expectedWidth, tableModel.width());
    });
  };

  const cAssertHeight = function (expectedWidth) {
    return Chain.op(function (tableModel: any) {
      Assertions.assertEq('Should be expected height', expectedWidth, tableModel.rows().length);
    });
  };

  const cAssertModelAsHtml = function (expectedHtml) {
    return Chain.op(function (tableModel) {
      const actualHtml = Html.getOuter(SimpleTableModel.toDom(tableModel));
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
        cFromDomSubSection('<table><tbody><tr><td>A</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 0, 0 ]),
        cAssertWidth(1),
        cAssertHeight(1),
        cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr></tbody></table>')
      ])),
      Logger.t('Table 2x2 subsection (1,1)-(2,1)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 0, 1 ]),
        cAssertWidth(2),
        cAssertHeight(1),
        cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')
      ])),
      Logger.t('Table 2x2 subsection (2,1)-(1,1)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 1 ], [ 0, 0, 0 ]),
        cAssertWidth(2),
        cAssertHeight(1),
        cAssertModelAsHtml('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')
      ])),
      Logger.t('Table 2x2 subsection (1,1)-(1,2)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 0, 0 ], [ 0, 1, 0 ]),
        cAssertWidth(1),
        cAssertHeight(2),
        cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>')
      ])),
      Logger.t('Table 2x2 subsection (1,2)-(1,1)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>', [ 0, 1, 0 ], [ 0, 0, 0 ]),
        cAssertWidth(1),
        cAssertHeight(2),
        cAssertModelAsHtml('<table><tbody><tr><td>A</td></tr><tr><td>C</td></tr></tbody></table>')
      ])),
      Logger.t('Table 3x3 subsection (2,2)-(3,3)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [ 0, 1, 1 ], [ 0, 2, 2 ]),
        cAssertWidth(2),
        cAssertHeight(2),
        cAssertModelAsHtml('<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>')
      ])),
      Logger.t('Table 3x3 subsection (3,3)-(2,2)', Chain.asStep({}, [
        cFromDomSubSection('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td><td>E</td><td>F</td></tr><tr><td>G</td><td>H</td><td>I</td></tr></tbody></table>', [ 0, 2, 2 ], [ 0, 1, 1 ]),
        cAssertWidth(2),
        cAssertHeight(2),
        cAssertModelAsHtml('<table><tbody><tr><td>E</td><td>F</td></tr><tr><td>H</td><td>I</td></tr></tbody></table>')
      ]))
    ]))
  ], function () {
    success();
  }, failure);
});
