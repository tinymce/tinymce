import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Hierarchy } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import SelectionUtils from 'tinymce/core/selection/SelectionUtils';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.selection.SelectionUtilsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var viewBlock = ViewBlock();

  var cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  var cHasAllContentsSelected = function (startPath, startOffset, endPath, endOffset) {
    return Chain.mapper(function (viewBlock) {
      var sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
      var ec = Hierarchy.follow(Element.fromDom(viewBlock.get()), endPath).getOrDie();
      var rng = document.createRange();

      rng.setStart(sc.dom(), startOffset);
      rng.setEnd(ec.dom(), endOffset);

      return SelectionUtils.hasAllContentsSelected(Element.fromDom(viewBlock.get()), rng);
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('All text is selected in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a</p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 0], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 0], 2),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph and sub element', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<b>b</b></p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 1, 0], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph and with traling br', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<br></p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 0], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('Collapsed range in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a</p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 0], 0),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial text selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([0, 0], 0, [0, 0], 1),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial text selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([0, 0], 1, [0, 0], 2),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial mixed selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<b>bc</b></p>'),
      cHasAllContentsSelected([0, 0], 1, [0, 1, 0], 1),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});

