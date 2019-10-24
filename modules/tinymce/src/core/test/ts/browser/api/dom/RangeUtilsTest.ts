import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ViewBlock from '../../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.api.dom.RangeUtilsTest', function (success, failure) {
  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock();

  const createRange = function (sc, so, ec, eo) {
    const rng = DOM.createRng();
    rng.setStart(sc, so);
    rng.setEnd(ec, eo);
    return rng;
  };

  const assertRange = function (expected, actual) {
    Assertions.assertEq('startContainers should be equal', true, expected.startContainer === actual.startContainer);
    Assertions.assertEq('startOffset should be equal', true, expected.startOffset === actual.startOffset);
    Assertions.assertEq('endContainer should be equal', true, expected.endContainer === actual.endContainer);
    Assertions.assertEq('endOffset should be equal', true, expected.endOffset === actual.endOffset);
  };

  const sTestDontNormalizeAtAnchors = Logger.t('Don\'t normalize at anchors', Step.sync(function () {
    viewBlock.update('a<a href="#">b</a>c');

    const rng1 = createRange(viewBlock.get().firstChild, 1, viewBlock.get().firstChild, 1);
    const rng1Clone = rng1.cloneRange();
    Assertions.assertEq('label', false, RangeUtils(DOM).normalize(rng1));
    assertRange(rng1Clone, rng1);

    const rng2 = createRange(viewBlock.get().lastChild, 0, viewBlock.get().lastChild, 0);
    const rng2Clone = rng2.cloneRange();
    Assertions.assertEq('label', false, RangeUtils(DOM).normalize(rng2));
    assertRange(rng2Clone, rng2);
  }));

  const sTestNormalize = GeneralSteps.sequence([
    sTestDontNormalizeAtAnchors
  ]);

  Pipeline.async({}, [
    sTestNormalize
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
