define(
  'tinymce.core.test.CaretAsserts',
  [
    'ephox.agar.api.Assertions',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils'
  ],
  function (Assertions, LegacyUnit, DOMUtils) {
    var assertCaretPosition = function (actual, expected, message) {
      if (expected === null) {
        LegacyUnit.strictEqual(actual, expected, message || 'Expected null.');
        return;
      }

      if (actual === null) {
        LegacyUnit.strictEqual(actual, expected, message || 'Didn\'t expect null.');
        return;
      }

      Assertions.assertEq(message, true, expected.isEqual(actual));
    };

    var assertRange = function (expected, actual) {
      Assertions.assertEq('startContainers should be equal', true, expected.startContainer === actual.startContainer);
      Assertions.assertEq('startOffset should be equal', true, expected.startOffset === actual.startOffset);
      Assertions.assertEq('endContainer should be equal', true, expected.endContainer === actual.endContainer);
      Assertions.assertEq('endOffset should be equal', true, expected.endOffset === actual.endOffset);
    };

    var createRange = function (startContainer, startOffset, endContainer, endOffset) {
      var rng = DOMUtils.DOM.createRng();

      rng.setStart(startContainer, startOffset);

      if (endContainer) {
        rng.setEnd(endContainer, endOffset);
      }

      return rng;
    };

    return {
      createRange: createRange,
      assertCaretPosition: assertCaretPosition,
      assertRange: assertRange
    };
  }
);