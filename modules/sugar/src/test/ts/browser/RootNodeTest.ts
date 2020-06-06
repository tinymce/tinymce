import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, Element as DomElement, HTMLIFrameElement, navigator, ShadowRoot, Window } from '@ephox/dom-globals';
import { browserSupportsGetRootNode, getRootNode, isDocument, isShadowRoot, RootNode } from 'ephox/sugar/api/node/RootNode';
import { Testable } from '@ephox/dispute';
import { PlatformDetection } from '@ephox/sand';

const withNormalElement = (f: (d: DomElement) => void): void => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  try {
    f(div);
  } finally {
    document.body.removeChild(div);
  }
};

const withShadowElementInMode = (mode: 'open' | 'closed', f: (sr: ShadowRoot, innerDiv: DomElement) => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const sr = div.attachShadow({ mode });
  const innerDiv = document.createElement('div');
  sr.appendChild(innerDiv);

  try {
    f(sr, innerDiv);
  } finally {
    document.body.removeChild(div);
  }
};

const withShadowElement = (f: (sr: ShadowRoot, innerDiv: DomElement) => void): void => {
  withShadowElementInMode('open', f);
  withShadowElementInMode('closed', f);
};


const withIframe = (f: (div: DomElement, iframe: HTMLIFrameElement, cw: Window) => void): void => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);

  const cw = iframe.contentWindow;
  if (cw === null) {
    throw new Error('contentWindow was null');
  }

  cw.document.open();
  cw.document.write('<html><head></head><body></body><html></html>');
  const div = cw.document.createElement('div');
  cw.document.body.appendChild(div);
  try {
    f(div, iframe, cw);
  } finally {
    document.body.removeChild(iframe);
  }
};

const shouldBeShadowRoot = (n: RootNode) => {
  Assert.eq('should be shadow root', true, isShadowRoot(n));
  Assert.eq('should not be document', false, isDocument(n));
};

const shouldBeDocument = (n: RootNode) => {
  Assert.eq('should not be shadow root', false, isShadowRoot(n));
  Assert.eq('should be document', true, isDocument(n));
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', document, getRootNode(div), Testable.tStrict);
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    shouldBeDocument(getRootNode(div));
  });
});

UnitTest.test('document is document', () => {
  shouldBeDocument(document);
});

if (browserSupportsGetRootNode()) {
  UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should be shadowroot', sr, getRootNode(innerDiv), Testable.tStrict);
    });
  });

  UnitTest.test('shadow root is shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      shouldBeShadowRoot(getRootNode(innerDiv));
      shouldBeShadowRoot(sr);
    });
  });
}

UnitTest.test('getRootNode in iframe', () => {
  withIframe((div: DomElement, iframe: HTMLIFrameElement, cw: Window) => {
    Assert.eq('should be inner doc', cw.document, getRootNode(div), Testable.tStrict);
  });
});

UnitTest.test('isDocument in iframe', () => {
  withIframe((div: DomElement, iframe: HTMLIFrameElement, cw: Window) => {
    shouldBeDocument(cw.document);
  });
});

// TODO: this should be in sand
const isPhantomJs = (): boolean =>
  navigator.userAgent.indexOf('PhantomJS') > -1;

UnitTest.test('browserSupportsGetRootNode platform test', () => {
  const browser = PlatformDetection.detect().browser;
  if (browser.isIE()) {
    Assert.eq('IE does not support root node', false, browserSupportsGetRootNode());
  } else if (browser.isEdge()) {
    // could be yes or no
  } else if (isPhantomJs()) {
    Assert.eq('PhantomJS does not support root node', false, browserSupportsGetRootNode());
  } else {
    Assert.eq('This browser should support root node', true, browserSupportsGetRootNode());
  }
});
