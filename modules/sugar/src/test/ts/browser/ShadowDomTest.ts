import { Assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import { Element as DomElement, navigator, ShadowRoot } from '@ephox/dom-globals';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import fc from 'fast-check';
import { PlatformDetection } from '@ephox/sand';
import * as ShadowDom from 'ephox/sugar/api/node/ShadowDom';
import { Testable } from '@ephox/dispute';
import { htmlBlockTagName, htmlInlineTagName } from 'ephox/sugar/test/Arbitrary';
import {
  withIframe,
  withNormalElement,
  withShadowElement,
  withShadowElementInMode,
  setupShadowRoot
} from 'ephox/sugar/test/WithHelpers';
import { tElement } from 'ephox/sugar/test/ElementInstances';
import * as Document from 'ephox/sugar/api/node/Document';
import * as Head from 'ephox/sugar/api/node/Head';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Node from 'ephox/sugar/api/node/Node';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import { Arr } from '@ephox/katamari';

type RootNode = ShadowDom.RootNode;

UnitTest.test('ShadowDom - SelectorFind.descendant', () => {
  if (ShadowDom.isSupported()) {
    fc.assert(fc.property(htmlBlockTagName(), htmlInlineTagName(), fc.hexaString(), (block, inline, text) => {
      withShadowElement((ss) => {
        const id = 'theid';
        const inner = Element.fromHtml(`<${block}><p>hello<${inline} id="${id}">${text}</${inline}></p></${block}>`);
        Insert.append(ss, inner);

        const frog: Element<DomElement> = SelectorFind.descendant(ss, `#${id}`).getOrDie('Element not found');
        Assert.eq('textcontent', text, frog.dom().textContent);
      });
    }));
  }
});

const shouldBeShadowRoot = (n: RootNode) => {
  Assert.eq('should be shadow root', true, ShadowDom.isShadowRoot(n));
  Assert.eq('should not be document', false, Node.isDocument(n));
};

const shouldBeDocument = (n: RootNode) => {
  Assert.eq('should not be shadow root', false, ShadowDom.isShadowRoot(n));
  Assert.eq('should be document', true, Node.isDocument(n));
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', Document.getDocument(), ShadowDom.getRootNode(div), tElement());
  });
});

UnitTest.test('getRootNode(document) === document on normal element in dom', () => {
  withNormalElement(() => {
    Assert.eq('should be document', Document.getDocument(), ShadowDom.getRootNode(Document.getDocument()), tElement());
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    shouldBeDocument(ShadowDom.getRootNode(div));
  });
});

UnitTest.test('document is document', () => {
  shouldBeDocument(Document.getDocument());
});

UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
  withShadowElement((sr, innerDiv) => {
    Assert.eq('should be shadowroot', sr, ShadowDom.getRootNode(innerDiv), tElement());
  });
});

UnitTest.test('getRootNode(shadowroot) === shadowroot', () => {
  withShadowElement((sr) => {
    Assert.eq('should be shadowroot', sr, sr, tElement());
  });
});

UnitTest.test('shadow root is shadow root', () => {
  withShadowElement((sr, innerDiv) => {
    shouldBeShadowRoot(ShadowDom.getRootNode(innerDiv));
    shouldBeShadowRoot(sr);
  });
});

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

// TODO: this should be somewhere else (maybe Agar?)
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

UnitTest.test('stylecontainer is shadow root for shadow root', () => {
  withShadowElement((sr) => {
    Assert.eq('Should be shadow root', sr, ShadowDom.getStyleContainer(sr), tElement());
  });
});

UnitTest.test('stylecontainer is head for document', () => {
  Assert.eq('Should be head', Head.getHead(Document.getDocument()), ShadowDom.getStyleContainer(Document.getDocument()), tElement());
});

UnitTest.test('contentcontainer is shadow root for shadow root', () => {
  withShadowElement((sr) => {
    Assert.eq('Should be shadow root', sr, ShadowDom.getContentContainer(sr), tElement());
  });
});

UnitTest.test('contentcontainer is body for document', () => {
  Assert.eq('Should be head', Body.getBody(Document.getDocument()), ShadowDom.getContentContainer(Document.getDocument()), tElement());
});

UnitTest.test('getShadowHost', () => {
  withShadowElement((sr, inner, sh) => {
    Assert.eq('Should be shadow host', sh, ShadowDom.getShadowHost(sr), tElement());
  });
});

UnitTest.test('isOpenShadowRoot / isClosedShadowRoot', () => {
  withShadowElementInMode('open', (sr) => {
    Assert.eq('open shadow root is open', true, ShadowDom.isOpenShadowRoot(sr));
    Assert.eq('open shadow root is not closed', false, ShadowDom.isClosedShadowRoot(sr));
  });
  withShadowElementInMode('closed', (sr) => {
    Assert.eq('closed shadow root is not open', false, ShadowDom.isOpenShadowRoot(sr));
    Assert.eq('closed shadow root is closed', true, ShadowDom.isClosedShadowRoot(sr));
  });
});

const checkOriginalEventTarget = (mode: 'open' | 'closed', success: UnitTest.SuccessCallback, failure: UnitTest.FailureCallback): void => {
  const { innerDiv, shadowHost } = setupShadowRoot(mode);

  const input = (desc: string, parent: Element<DomElement>) => {
    const i = Element.fromTag('input');
    Attr.setAll(i, { 'type': 'text', 'data-description': desc });
    Insert.append(parent, i);
    return i;
  };

  const i1 = input('i2', Body.body());
  const i2 = input('i2', innerDiv);

  i1.dom().click();

  const unbinder = DomEvent.bind(Body.body(), 'click', (evt) => {
    try {
      const expected = mode === 'open' ? i2 : shadowHost;
      Assert.eq('Check event target', expected, evt.target(), tElement());
      unbinder.unbind();
      Remove.remove(i1);
      Remove.remove(shadowHost);
      success();
    } catch (e) {
      failure(e);
    }
  });
  i2.dom().click();
};

UnitTest.asynctest('getOriginalEventTarget on a closed shadow root', (success, failure) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  checkOriginalEventTarget('closed', success, failure);
});

UnitTest.asynctest('getOriginalEventTarget on an open shadow root', (success, failure) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }
  checkOriginalEventTarget('open', success, failure);
});

UnitTest.test('isOpenShadowHost on open shadow host', () => {
  withShadowElementInMode('open', (shadowRoot, innerDiv, shadowHost) => () => {
    Assert.eq('The open shadow host is an open shadow host', true, ShadowDom.isOpenShadowHost(shadowHost));
    Assert.eq('The innerDiv is not an open shadow host', false, ShadowDom.isOpenShadowHost(innerDiv));
  });
});

UnitTest.test('isOpenShadowHost on closed shadow host', () => {
  withShadowElementInMode('closed', (shadowRoot, innerDiv, shadowHost) => () => {
    Assert.eq('The closed shadow host is an open shadow host', false, ShadowDom.isOpenShadowHost(shadowHost));
    Assert.eq('The innerDiv is not an open shadow host', false, ShadowDom.isOpenShadowHost(innerDiv));
  });
});

if (ShadowDom.isSupported()) {
  UnitTest.test('withShadowElement gives us open and closed roots', () => {
    const roots: Array<Element<ShadowRoot>> = [];
    withShadowElement((sr) => {
      roots.push(sr);
    });
    Assert.eq('open then closed', [ 'open', 'closed' ], Arr.map(roots, (r) => (r.dom() as any).mode ));
  });
}
