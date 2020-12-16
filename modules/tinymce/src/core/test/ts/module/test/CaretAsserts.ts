import { Assertions } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const assertCaretPosition = (actual, expected, message?) => {
  if (expected === null) {
    LegacyUnit.strictEqual(actual, expected, message || 'Expected null.');
    return;
  }

  if (actual === null) {
    LegacyUnit.strictEqual(actual, expected, message || `Didn't expect null.`);
    return;
  }

  const defaultMessage = () => `["${expected.getNode().textContent}", ${expected.offset()}] doesn't match actual position ["${actual.getNode().textContent}", ${actual.offset()}]`;
  Assertions.assertEq(() => message || defaultMessage(), true, expected.isEqual(actual));
};

const assertRange = (expected, actual) => {
  Assertions.assertEq('startContainers should be equal', true, expected.startContainer === actual.startContainer);
  Assertions.assertEq('startOffset should be equal', true, expected.startOffset === actual.startOffset);
  Assertions.assertEq('endContainer should be equal', true, expected.endContainer === actual.endContainer);
  Assertions.assertEq('endOffset should be equal', true, expected.endOffset === actual.endOffset);
};

const createRange = (startContainer, startOffset, endContainer?, endOffset?): Range => {
  const rng = DOMUtils.DOM.createRng();

  rng.setStart(startContainer, startOffset);

  if (endContainer) {
    rng.setEnd(endContainer, endOffset);
  }

  return rng;
};

export {
  createRange,
  assertCaretPosition,
  assertRange
};
