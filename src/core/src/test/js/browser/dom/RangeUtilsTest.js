asynctest(
  'browser.tinymce.core.dom.RangeUtilsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, DOMUtils, RangeUtils, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var DOM = DOMUtils.DOM;
    var viewBlock = new ViewBlock();

    var createRange = function (sc, so, ec, eo) {
      var rng = DOM.createRng();
      rng.setStart(sc, so);
      rng.setEnd(ec, eo);
      return rng;
    };

    var assertRange = function (expected, actual) {
      Assertions.assertEq('startContainers should be equal', true, expected.startContainer === actual.startContainer);
      Assertions.assertEq('startOffset should be equal', true, expected.startOffset === actual.startOffset);
      Assertions.assertEq('endContainer should be equal', true, expected.endContainer === actual.endContainer);
      Assertions.assertEq('endOffset should be equal', true, expected.endOffset === actual.endOffset);
    };

    var sTestDontNormalizeAtAnchors = Logger.t('Don\'t normalize at anchors', Step.sync(function () {
      viewBlock.update('a<a href="#">b</a>c');

      var rng1 = createRange(viewBlock.get().firstChild, 1, viewBlock.get().firstChild, 1);
      var rng1Clone = rng1.cloneRange();
      Assertions.assertEq('label', false, new RangeUtils(DOM).normalize(rng1));
      assertRange(rng1Clone, rng1);

      var rng2 = createRange(viewBlock.get().lastChild, 0, viewBlock.get().lastChild, 0);
      var rng2Clone = rng2.cloneRange();
      Assertions.assertEq('label', false, new RangeUtils(DOM).normalize(rng2));
      assertRange(rng2Clone, rng2);
    }));

    var sTestNormalize = GeneralSteps.sequence([
      sTestDontNormalizeAtAnchors
    ]);

    Pipeline.async({}, [
      sTestNormalize
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
