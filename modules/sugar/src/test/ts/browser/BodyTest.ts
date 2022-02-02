import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarShadowDom from 'ephox/sugar/api/node/SugarShadowDom';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import { withShadowElement } from 'ephox/sugar/test/WithHelpers';

UnitTest.test('Body.inBody - detached elements and their descendents', () => {
  const div = SugarElement.fromTag('div');
  const child = SugarElement.fromTag('span');
  const text = SugarElement.fromText('hi');
  Insert.append(child, text);
  Insert.append(div, child);
  Assert.eq('should not be in body', false, SugarBody.inBody(div));
  Assert.eq('should not be in body', false, SugarBody.inBody(child));
  Assert.eq('should not be in body', false, SugarBody.inBody(text));
});

UnitTest.test('Body.inBody - elements in body', () => {
  const body = SelectorFind.first('body').getOrDie();

  const div = SugarElement.fromTag('div');
  const child = SugarElement.fromTag('span');
  const text = SugarElement.fromText('hi');
  Insert.append(child, text);
  Insert.append(div, child);
  Insert.append(body, div);
  Assert.eq('should be in body', true, SugarBody.inBody(div));
  Assert.eq('should be in body', true, SugarBody.inBody(child));
  Assert.eq('should be in body', true, SugarBody.inBody(text));
  Assert.eq('should be in body', true, SugarBody.inBody(body));
  Remove.remove(div);
});

if (SugarShadowDom.isSupported()) {
  UnitTest.test('Body.inBody - shadow root', () => {
    withShadowElement((sr) => {
      Assert.eq('should be inBody', true, SugarBody.inBody(sr));
    });
  });

  UnitTest.test('Body.inBody - element in shadow root', () => {
    withShadowElement((sr) => {
      Assert.eq('should be inBody', true, SugarBody.inBody(sr));
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

    Assert.eq('div1 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(div1)));
    Assert.eq('div2 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(div2)));
    Assert.eq('div3 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(div3)));
    Assert.eq('div4 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(div4)));

    Assert.eq('sr1 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(sr1)));
    Assert.eq('sr2 should be inBody', true, SugarBody.inBody(SugarElement.fromDom(sr2)));
    document.body.removeChild(div1);
  });
}
