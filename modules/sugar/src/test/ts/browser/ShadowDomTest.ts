import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { Arr } from '@ephox/katamari';
import fc from 'fast-check';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import * as SugarDocument from 'ephox/sugar/api/node/SugarDocument';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import { tElement } from 'ephox/sugar/api/node/SugarElementInstances';
import * as SugarHead from 'ephox/sugar/api/node/SugarHead';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import * as SugarShadowDom from 'ephox/sugar/api/node/SugarShadowDom';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import { htmlBlockTagName, htmlInlineTagName } from 'ephox/sugar/test/Arbitrary';
import { setupShadowRoot, withIframe, withNormalElement, withShadowElement, withShadowElementInMode } from 'ephox/sugar/test/WithHelpers';

type RootNode = SugarShadowDom.RootNode;

UnitTest.test('ShadowDom - SelectorFind.descendant', () => {
  if (SugarShadowDom.isSupported()) {
    fc.assert(fc.property(htmlBlockTagName(), htmlInlineTagName(), fc.hexaString(), (block, inline, text) => {
      withShadowElement((ss) => {
        const id = 'theid';
        const inner = SugarElement.fromHtml(`<${block}><p>hello<${inline} id="${id}">${text}</${inline}></p></${block}>`);
        Insert.append(ss, inner);

        const frog: SugarElement<Element> = SelectorFind.descendant(ss, `#${id}`).getOrDie('Element not found');
        Assert.eq('textcontent', text, frog.dom.textContent);
      });
    }));
  }
});

const shouldBeShadowRoot = (n: RootNode) => {
  Assert.eq('should be shadow root', true, SugarShadowDom.isShadowRoot(n));
  Assert.eq('should not be document', false, SugarNode.isDocument(n));
};

const shouldBeDocument = (n: RootNode) => {
  Assert.eq('should not be shadow root', false, SugarShadowDom.isShadowRoot(n));
  Assert.eq('should be document', true, SugarNode.isDocument(n));
};

UnitTest.test('getRootNode === document on normal element in dom', () => {
  withNormalElement((div) => {
    Assert.eq('should be document', SugarDocument.getDocument(), SugarShadowDom.getRootNode(div), tElement());
  });
});

UnitTest.test('getRootNode(document) === document on normal element in dom', () => {
  withNormalElement(() => {
    Assert.eq('should be document', SugarDocument.getDocument(), SugarShadowDom.getRootNode(SugarDocument.getDocument()), tElement());
  });
});

UnitTest.test('isDocument(getRootNode) === true on normal element in dom', () => {
  withNormalElement((div) => {
    shouldBeDocument(SugarShadowDom.getRootNode(div));
  });
});

UnitTest.test('document is document', () => {
  shouldBeDocument(SugarDocument.getDocument());
});

UnitTest.test('getRootNode === shadowroot on element in shadow root', () => {
  withShadowElement((sr, innerDiv) => {
    Assert.eq('should be shadowroot', sr, SugarShadowDom.getRootNode(innerDiv), tElement());
  });
});

UnitTest.test('getRootNode(shadowroot) === shadowroot', () => {
  withShadowElement((sr) => {
    Assert.eq('should be shadowroot', sr, sr, tElement());
  });
});

UnitTest.test('shadow root is shadow root', () => {
  withShadowElement((sr, innerDiv) => {
    shouldBeShadowRoot(SugarShadowDom.getRootNode(innerDiv));
    shouldBeShadowRoot(sr);
  });
});

UnitTest.test('getRootNode in iframe', () => {
  withIframe((div, iframe, cw) => {
    Assert.eq('should be inner doc', cw.document, SugarShadowDom.getRootNode(div).dom, Testable.tStrict);
  });
});

UnitTest.test('isDocument in iframe', () => {
  withIframe((div, iframe, cw) => {
    shouldBeDocument(SugarElement.fromDom(cw.document));
  });
});

UnitTest.test('isSupported platform test', () => {
  // as of TinyMCE 6 all browsers support it
  Assert.eq('This browser should support root node', true, SugarShadowDom.isSupported());
});

UnitTest.test('stylecontainer is shadow root for shadow root', () => {
  withShadowElement((sr) => {
    Assert.eq('Should be shadow root', sr, SugarShadowDom.getStyleContainer(sr), tElement());
  });
});

UnitTest.test('stylecontainer is head for document', () => {
  Assert.eq('Should be head', SugarHead.getHead(SugarDocument.getDocument()), SugarShadowDom.getStyleContainer(SugarDocument.getDocument()), tElement());
});

UnitTest.test('contentcontainer is shadow root for shadow root', () => {
  withShadowElement((sr) => {
    Assert.eq('Should be shadow root', sr, SugarShadowDom.getContentContainer(sr), tElement());
  });
});

UnitTest.test('contentcontainer is body for document', () => {
  Assert.eq('Should be head', SugarBody.getBody(SugarDocument.getDocument()), SugarShadowDom.getContentContainer(SugarDocument.getDocument()), tElement());
});

UnitTest.test('getShadowHost', () => {
  withShadowElement((sr, inner, sh) => {
    Assert.eq('Should be shadow host', sh, SugarShadowDom.getShadowHost(sr), tElement());
  });
});

UnitTest.test('isOpenShadowRoot / isClosedShadowRoot', () => {
  withShadowElementInMode('open', (sr) => {
    Assert.eq('open shadow root is open', true, SugarShadowDom.isOpenShadowRoot(sr));
    Assert.eq('open shadow root is not closed', false, SugarShadowDom.isClosedShadowRoot(sr));
  });
  withShadowElementInMode('closed', (sr) => {
    Assert.eq('closed shadow root is not open', false, SugarShadowDom.isOpenShadowRoot(sr));
    Assert.eq('closed shadow root is closed', true, SugarShadowDom.isClosedShadowRoot(sr));
  });
});

const checkOriginalEventTarget = (mode: 'open' | 'closed', success: UnitTest.SuccessCallback, failure: UnitTest.FailureCallback): void => {
  const { innerDiv, shadowHost } = setupShadowRoot(mode);

  const input = (desc: string, parent: SugarElement<Element>) => {
    const i = SugarElement.fromTag('input');
    Attribute.setAll(i, { 'type': 'text', 'data-description': desc });
    Insert.append(parent, i);
    return i;
  };

  const i1 = input('i2', SugarBody.body());
  const i2 = input('i2', innerDiv);

  i1.dom.click();

  const unbinder = DomEvent.bind(SugarBody.body(), 'click', (evt) => {
    try {
      const expected = mode === 'open' ? i2 : shadowHost;
      Assert.eq('Check event target', expected, evt.target, tElement());
      unbinder.unbind();
      Remove.remove(i1);
      Remove.remove(shadowHost);
      success();
    } catch (e: any) {
      failure(e);
    }
  });
  i2.dom.click();
};

UnitTest.asynctest('getOriginalEventTarget on a closed shadow root', (success, failure) => {
  if (!SugarShadowDom.isSupported()) {
    return success();
  }

  checkOriginalEventTarget('closed', success, failure);
});

UnitTest.asynctest('getOriginalEventTarget on an open shadow root', (success, failure) => {
  if (!SugarShadowDom.isSupported()) {
    return success();
  }
  checkOriginalEventTarget('open', success, failure);
});

UnitTest.test('isOpenShadowHost on open shadow host', () => {
  withShadowElementInMode('open', (shadowRoot, innerDiv, shadowHost) => () => {
    Assert.eq('The open shadow host is an open shadow host', true, SugarShadowDom.isOpenShadowHost(shadowHost));
    Assert.eq('The innerDiv is not an open shadow host', false, SugarShadowDom.isOpenShadowHost(innerDiv));
  });
});

UnitTest.test('isOpenShadowHost on closed shadow host', () => {
  withShadowElementInMode('closed', (shadowRoot, innerDiv, shadowHost) => () => {
    Assert.eq('The closed shadow host is an open shadow host', false, SugarShadowDom.isOpenShadowHost(shadowHost));
    Assert.eq('The innerDiv is not an open shadow host', false, SugarShadowDom.isOpenShadowHost(innerDiv));
  });
});

if (SugarShadowDom.isSupported()) {
  UnitTest.test('withShadowElement gives us open and closed roots', () => {
    const roots: Array<SugarElement<ShadowRoot>> = [];
    withShadowElement((sr) => {
      roots.push(sr);
    });
    Assert.eq('open then closed', [ 'open', 'closed' ], Arr.map(roots, (r) => (r.dom as any).mode ));
  });
}
