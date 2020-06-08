import { Assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import { document, Element as DomElement, HTMLIFrameElement, navigator, ShadowRoot, Window } from '@ephox/dom-globals';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import fc, { Arbitrary } from 'fast-check';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import { PlatformDetection } from '@ephox/sand';
import * as ShadowDom from 'ephox/sugar/api/node/ShadowDom';
import { Testable } from '@ephox/dispute';

type RootNode = ShadowDom.RootNode;

const shadowDomTest = (name: string, fn: () => void) => {
  if (DomElement.prototype.hasOwnProperty('attachShadow')) {
    UnitTest.test(name, fn);
  }
};

const withShadow = (f: (shadow: Element<ShadowRoot>) => void): void => {
  const body = Body.body();
  const e = Element.fromHtml<DomElement>('<div />');
  Insert.append(body, e);

  const shadow: ShadowRoot = e.dom().attachShadow({ mode: 'open' });
  const shadowE: Element<ShadowRoot> = Element.fromDom(shadow);

  try {
    f(shadowE);
  } finally {
    Remove.remove(e);
  }
};

const htmlBlockTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('div', 'article', 'section', 'main', 'h1', 'h2', 'h3', 'aside', 'nav');

const htmlInlineTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('span', 'b', 'i', 'u', 'strong', 'em');

shadowDomTest('ShadowDom - SelectorFind.descendant', () => {
  fc.assert(fc.property(htmlBlockTagName(), htmlInlineTagName(), fc.hexaString(), (block, inline, text) => {
    withShadow((ss) => {
      const id = 'theid';
      const inner = Element.fromHtml(`<${block}><p>hello<${inline} id="${id}">${text}</${inline}></p></${block}>`);
      Insert.append(ss, inner);

      const frog: Element<DomElement> = SelectorFind.descendant(ss, `#${id}`).getOrDie('Element not found');
      Assert.eq('textcontent', text, frog.dom().textContent);
    });
  }));
});


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
  Assert.eq('should be shadow root', true, ShadowDom.isShadowRoot(n));
  Assert.eq('should not be document', false, ShadowDom.isDocument(n));
};

const shouldBeDocument = (n: RootNode) => {
  Assert.eq('should not be shadow root', false, ShadowDom.isShadowRoot(n));
  Assert.eq('should be document', true, ShadowDom.isDocument(n));
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', document, ShadowDom.getRootNode(div), Testable.tStrict);
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    shouldBeDocument(ShadowDom.getRootNode(div));
  });
});

UnitTest.test('document is document', () => {
  shouldBeDocument(document);
});

if (ShadowDom.isSupported()) {
  UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should be shadowroot', sr, ShadowDom.getRootNode(innerDiv), Testable.tStrict);
    });
  });

  UnitTest.test('shadow root is shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      shouldBeShadowRoot(ShadowDom.getRootNode(innerDiv));
      shouldBeShadowRoot(sr);
    });
  });
}

UnitTest.test('getRootNode in iframe', () => {
  withIframe((div: DomElement, iframe: HTMLIFrameElement, cw: Window) => {
    Assert.eq('should be inner doc', cw.document, ShadowDom.getRootNode(div), Testable.tStrict);
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

UnitTest.test('isSupported platform test', () => {
  const browser = PlatformDetection.detect().browser;
  if (browser.isIE()) {
    Assert.eq('IE does not support root node', false, ShadowDom.isSupported());
  } else if (browser.isEdge()) {
    // could be yes or no
  } else if (isPhantomJs()) {
    Assert.eq('PhantomJS does not support root node', false, ShadowDom.isSupported());
  } else {
    Assert.eq('This browser should support root node', true, ShadowDom.isSupported());
  }
});
