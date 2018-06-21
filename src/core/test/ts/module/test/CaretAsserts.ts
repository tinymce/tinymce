import { Assertions } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Range } from '@ephox/dom-globals';

const assertCaretPosition = function (actual, expected, message?) {
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

const assertRange = function (expected, actual) {
  Assertions.assertEq('startContainers should be equal', true, expected.startContainer === actual.startContainer);
  Assertions.assertEq('startOffset should be equal', true, expected.startOffset === actual.startOffset);
  Assertions.assertEq('endContainer should be equal', true, expected.endContainer === actual.endContainer);
  Assertions.assertEq('endOffset should be equal', true, expected.endOffset === actual.endOffset);
};

const createRange = function (startContainer, startOffset, endContainer?, endOffset?): Range {
  const rng = DOMUtils.DOM.createRng();

  rng.setStart(startContainer, startOffset);

  if (endContainer) {
    rng.setEnd(endContainer, endOffset);
  }

  return rng;
};

export default {
  createRange,
  assertCaretPosition,
  assertRange
};