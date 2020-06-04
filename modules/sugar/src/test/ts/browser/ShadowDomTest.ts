import { Assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import { Element as DomElement, ShadowRoot, window } from '@ephox/dom-globals';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';

UnitTest.test('ShadowDom - SelectorFind.descendant', () => {
  const body = Body.body();
  const e = Element.fromHtml<DomElement>('<div />');
  Insert.append(body, e);

  const shadow: ShadowRoot = e.dom().attachShadow({ mode: 'open' });
  const ss: Element<ShadowRoot> = Element.fromDom(shadow);
  const inner = Element.fromHtml('<div><p>hello<span id="frog">iamthefrog</span></p></div>');
  (window as any).myshadow = shadow;
  Insert.append(ss, inner);

  const frog: Element<DomElement> = SelectorFind.descendant(ss, '#frog').getOrDie('Element not found');
  Assert.eq('textcontent', 'iamthefrog', frog.dom().textContent);
});
