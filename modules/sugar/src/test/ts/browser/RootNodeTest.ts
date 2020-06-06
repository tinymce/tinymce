import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Element as DomElement, ShadowRoot } from '@ephox/dom-globals';
import { getRootNode, isDocument, isShadowRoot, browserSupportsGetRootNode } from 'ephox/sugar/api/node/RootNode';
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

const withShadowElementInMode = (mode: 'open' | 'closed', f: (sr: ShadowRoot, innerDiv: DomElement) => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const sr = div.attachShadow({ mode });
  const innerDiv = document.createElement('div');
  sr.appendChild(innerDiv);

  try {
    f(sr, innerDiv)
  } finally {
    div.remove();
  }
};

const withShadowElement = (f: (sr: ShadowRoot, innerDiv: DomElement) => void): void => {
  withShadowElementInMode('open', f);
  withShadowElementInMode('closed', f);
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', document, getRootNode(div), Testable.tStrict);
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', true, isDocument(getRootNode(div)));
  });
});

UnitTest.test('isShadowRoot(getRootNode) === false on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should not be shadowroot', false, isShadowRoot(getRootNode(div)));
  });
});

UnitTest.test('isShadowRoot(document) === false', () => {
  Assert.eq('should not be shadow root', false, isShadowRoot(document));
});

UnitTest.test('isDocument(document) === true', () => {
  Assert.eq('should be document', true, isDocument(document));
});

if (browserSupportsGetRootNode()) {
  UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should be shadowroot', sr, getRootNode(innerDiv), Testable.tStrict);
    })
  });

  UnitTest.test('isDocument(getRootNode) === false on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should not be document', false, isDocument(getRootNode(innerDiv)));
    })
  });

  UnitTest.test('isShadowRoot(getRootNode) === true on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should be shadow root', true, isShadowRoot(getRootNode(innerDiv)));
    })
  });

  UnitTest.test('isShadowRoot(shadowRoot) === true', () => {
    withShadowElement((sr) => {
      Assert.eq('should be shadow root', true, isShadowRoot(sr));
    });
  });

  UnitTest.test('isDocument(shadowRoot) === false', () => {
    withShadowElement((sr) => {
      Assert.eq('should not be document', false, isDocument(sr));
    });
  });
}
