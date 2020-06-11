import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import * as ShadowDom from 'ephox/sugar/api/node/ShadowDom';
import { withShadowElement } from 'ephox/sugar/test/WithHelpers';
import { document } from '@ephox/dom-globals';

UnitTest.test('Body.inBody - detached elements and their descendents', () => {
  const div = Element.fromTag('div');
  const child = Element.fromTag('span');
  const text = Element.fromText('hi');
  Insert.append(child, text);
  Insert.append(div, child);
  Assert.eq('should not be in body', false, Body.inBody(div));
  Assert.eq('should not be in body', false, Body.inBody(child));
  Assert.eq('should not be in body', false, Body.inBody(text));
});

UnitTest.test('Body.inBody - elements in body', () => {
  const body = SelectorFind.first('body').getOrDie();

  const div = Element.fromTag('div');
  const child = Element.fromTag('span');
  const text = Element.fromText('hi');
  Insert.append(child, text);
  Insert.append(div, child);
  Insert.append(body, div);
  Assert.eq('should be in body', true, Body.inBody(div));
  Assert.eq('should be in body', true, Body.inBody(child));
  Assert.eq('should be in body', true, Body.inBody(text));
  Assert.eq('should be in body', true, Body.inBody(body));
  Remove.remove(div);
});

if (ShadowDom.isSupported()) {
  UnitTest.test('Body.inBody - shadow root', () => {
    withShadowElement((sr) => {
      Assert.eq('should be inBody', true, Body.inBody(sr));
    });
  });

  UnitTest.test('Body.inBody - element in shadow root', () => {
    withShadowElement((sr) => {
      Assert.eq('should be inBody', true, Body.inBody(sr));
    });
  });

  UnitTest.test('Body.inBody - element in nested shadow root', () => {
    const div1 = document.createElement('div');
    document.body.appendChild(div1);

    const sr1 = div1.attachShadow({ mode: 'open' });
    const div2 = document.createElement('div');
    sr1.appendChild(div2);

    const sr2 = div2.attachShadow({ mode: 'open' });
    const div3 = document.createElement('div');
    sr2.appendChild(div3);

    const div4 = document.createElement('div');
    div3.appendChild(div4);

    Assert.eq('div1 should be inBody', true, Body.inBody(Element.fromDom(div1)));
    Assert.eq('div2 should be inBody', true, Body.inBody(Element.fromDom(div2)));
    Assert.eq('div3 should be inBody', true, Body.inBody(Element.fromDom(div3)));
    Assert.eq('div4 should be inBody', true, Body.inBody(Element.fromDom(div4)));

    Assert.eq('sr1 should be inBody', true, Body.inBody(Element.fromDom(sr1)));
    Assert.eq('sr2 should be inBody', true, Body.inBody(Element.fromDom(sr2)));
    document.body.removeChild(div1);
  });
}
