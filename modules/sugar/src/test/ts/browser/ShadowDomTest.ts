import { Assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import {
  document,
  Element as DomElement,
  navigator,
  ShadowRoot
} from '@ephox/dom-globals';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import fc from 'fast-check';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import { PlatformDetection } from '@ephox/sand';
import * as ShadowDom from 'ephox/sugar/api/node/ShadowDom';
import { Testable } from '@ephox/dispute';
import { htmlBlockTagName, htmlInlineTagName } from 'ephox/sugar/test/Arbitrary';
import { withIframe, withNormalElement, withShadowElement } from 'ephox/sugar/test/WithHelpers';

type RootNode = ShadowDom.RootNode;

const shadowDomTest = (name: string, fn: () => void) => {
  if (DomElement.prototype.hasOwnProperty('attachShadow')) {
    UnitTest.test(name, fn);
  }
};

const withShadow = (f: (shadow: Element<ShadowRoot>) => void): void => {
  const body = Body.body();
  const e = Element.fromTag('div');
  Insert.append(body, e);

  const shadow: ShadowRoot = e.dom().attachShadow({ mode: 'open' });
  const shadowE: Element<ShadowRoot> = Element.fromDom(shadow);

  try {
    f(shadowE);
  } finally {
    Remove.remove(e);
  }
};

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
    Assert.eq('should be document', document, ShadowDom.getRootNode(div).dom(), Testable.tStrict);
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    shouldBeDocument(ShadowDom.getRootNode(div));
  });
});

UnitTest.test('document is document', () => {
  shouldBeDocument(Element.fromDom(document));
});

if (ShadowDom.isSupported()) {
  UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
    withShadowElement((sr, innerDiv) => {
      Assert.eq('should be shadowroot', sr.dom(), ShadowDom.getRootNode(innerDiv).dom(), Testable.tStrict);
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
  withIframe((div, iframe, cw) => {
    Assert.eq('should be inner doc', cw.document, ShadowDom.getRootNode(div).dom(), Testable.tStrict);
  });
});

UnitTest.test('isDocument in iframe', () => {
  withIframe((div, iframe, cw) => {
    shouldBeDocument(Element.fromDom(cw.document));
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
