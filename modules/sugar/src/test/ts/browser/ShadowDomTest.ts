import Element from 'ephox/sugar/api/node/Element';
import { UnitTest, assert } from '@ephox/bedrock';
import { attachShadow, escapeShadowDom } from 'ephox/sugar/api/dom/ShadowDom';
import { Insert, Selectors } from '@ephox/sugar';

UnitTest.test('ShadowDomTest', function () {
  const root = Element.fromHtml(`<div id="root">
    <div id="inner">
        <a id="link"></a>
        <div id="shadow-dom"></div>
    </div>
  </div>`);

  const shadowDom = Selectors.one('#shadow-dom', root).getOrDie();
  const shadowRoot = attachShadow(shadowDom, { mode: 'open' });
  const shadowItem = Element.fromHtml(`<div id="shadow-item"></div>`);
  Insert.append(shadowRoot, shadowItem);

  assert.eq('root', escapeShadowDom(root).dom().id);
  assert.eq('inner', escapeShadowDom(Selectors.one('#inner', root).getOrDie()).dom().id);
  assert.eq('link', escapeShadowDom(Selectors.one('#link', root).getOrDie()).dom().id);
  assert.eq('shadow-dom', escapeShadowDom(shadowDom).dom().id);
  assert.eq('shadow-dom', escapeShadowDom(shadowItem).dom().id);
});
