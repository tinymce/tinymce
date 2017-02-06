define(
  'tinymce.core.test.CaretAsserts',
  [
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils'
  ],
  function (LegacyUnit, DOMUtils) {
    var assertCaretPosition = function (actual, expected, message) {
      if (expected === null) {
        LegacyUnit.strictEqual(actual, expected, message || 'Expected null.');
        return;
      }

      if (actual === null) {
        LegacyUnit.strictEqual(actual, expected, message || 'Didn\'t expect null.');
        return;
      }

      LegacyUnit.deepEqual({
        container: actual.container(),
        offset: actual.offset()
      }, {
        container: expected.container(),
        offset: expected.offset()
      }, message);
    };

    var assertRange = function (actual, expected) {
      LegacyUnit.deepEqual({
        startContainer: actual.startContainer,
        startOffset: actual.startOffset,
        endContainer: actual.endContainer,
        endOffset: actual.endOffset
      }, {
        startContainer: expected.startContainer,
        startOffset: expected.startOffset,
        endContainer: expected.endContainer,
        endOffset: expected.endOffset
      });
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