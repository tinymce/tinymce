import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Element as DomElement } from '@ephox/dom-globals';
import { getRootNode, isDocument, isShadowRoot } from 'ephox/sugar/api/node/RootNode';
import { Testable } from '@ephox/dispute';

const withNormalElement = (f: (d: DomElement) => void): void => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  try {
    f(div)
  } finally {
    div.remove();
  }
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', document, getRootNode(div), Testable.tStrict);
  });
});

UnitTest.test('isRootNode(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', true, isDocument(getRootNode(div)), Testable.tStrict);
  });
});

UnitTest.test('isShadowRoot(getRootNode) === false on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should not be shadowroot', false, isShadowRoot(getRootNode(div)), Testable.tStrict);
  });
});

