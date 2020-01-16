import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import { UnitTest, assert } from '@ephox/bedrock';
import { attachShadow } from 'ephox/sugar/api/dom/ShadowDom';

UnitTest.test('BodyTest', function () {
  const body = SelectorFind.first('body').getOrDie();

  const div = Element.fromTag('div');
  const child = Element.fromTag('span');
  const text = Element.fromText('hi');
  const shadowDom = Element.fromTag('div');
  const shadowRoot = attachShadow(shadowDom, { mode: 'open' });
  const shadowItem = Element.fromTag('span');
  Insert.append(child, text);
  Insert.append(div, child);
  Insert.append(div, shadowDom);
  Insert.append(shadowRoot, shadowItem);
  assert.eq(false, Body.inBody(div));
  assert.eq(false, Body.inBody(child));
  assert.eq(false, Body.inBody(text));
  assert.eq(false, Body.inBody(shadowDom));
  assert.eq(false, Body.inBody(shadowRoot));
  assert.eq(false, Body.inBody(shadowItem));

  Insert.append(body, div);
  assert.eq(true, Body.inBody(div));
  assert.eq(true, Body.inBody(child));
  assert.eq(true, Body.inBody(text));
  assert.eq(true, Body.inBody(body));
  assert.eq(true, Body.inBody(shadowDom));
  assert.eq(true, Body.inBody(shadowRoot));
  assert.eq(true, Body.inBody(shadowItem));

  Remove.remove(div);
});
