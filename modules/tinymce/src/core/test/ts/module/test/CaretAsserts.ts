import { Assert } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import CaretPosition from 'tinymce/core/caret/CaretPosition';

const assertCaretPosition = (actual: CaretPosition | null, expected: CaretPosition | null, message?: string) => {
  if (expected === null) {
    assert.strictEqual(actual, expected, message || 'Expected null.');
    return;
  }

  if (actual === null) {
    assert.strictEqual(actual, expected, message || `Didn't expect null.`);
    return;
  }

  const defaultMessage = () => `["${expected.getNode().textContent}", ${expected.offset()}] doesn't match actual position ["${actual.getNode().textContent}", ${actual.offset()}]`;
  Assert.eq(() => message || defaultMessage(), true, expected.isEqual(actual));
};

const assertRange = (expected: Range, actual: Range) => {
  assert.strictEqual(actual.startContainer, expected.startContainer, 'startContainers should be equal');
  assert.strictEqual(actual.startOffset, expected.startOffset, 'startOffset should be equal');
  assert.strictEqual(actual.endContainer, expected.endContainer, 'endContainer should be equal');
  assert.strictEqual(actual.endOffset, expected.endOffset, 'endOffset should be equal');
};

const createRange = (startContainer: Node, startOffset: number, endContainer?: Node, endOffset?: number): Range => {
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
