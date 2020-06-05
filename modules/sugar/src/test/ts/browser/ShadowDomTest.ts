import { Assert, UnitTest } from '@ephox/bedrock-client';
import Element from 'ephox/sugar/api/node/Element';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import { Element as DomElement, ShadowRoot } from '@ephox/dom-globals';
import * as SelectorFind from 'ephox/sugar/api/search/SelectorFind';
import fc, { Arbitrary } from 'fast-check';

const shadowDomTest = (name: string, fn: () => void) => {
  if (DomElement.prototype.hasOwnProperty('attachShadow')) {
    UnitTest.test(name, fn);
  }
};

const mkShadow = (): Element<ShadowRoot> => {
  const body = Body.body();
  const e = Element.fromHtml<DomElement>('<div />');
  Insert.append(body, e);

  const shadow: ShadowRoot = e.dom().attachShadow({ mode: 'open' });
  return Element.fromDom(shadow);
};

const htmlBlockTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('div', 'article', 'section', 'main', 'h1', 'h2', 'h3', 'aside', 'nav');

const htmlInlineTagName = (): Arbitrary<string> =>
  // note: list is incomplete
  fc.constantFrom('span', 'b', 'i', 'u', 'strong', 'em');

shadowDomTest('ShadowDom - SelectorFind.descendant', () => {
  fc.assert(fc.property(htmlBlockTagName(), htmlInlineTagName(), fc.hexaString(), (block, inline, text) => {
    const ss = mkShadow();
    const id = 'theid';
    const inner = Element.fromHtml(`<${block}><p>hello<${inline} id="${id}">${text}</${inline}></p></${block}>`);
    Insert.append(ss, inner);

    const frog: Element<DomElement> = SelectorFind.descendant(ss, `#${id}`).getOrDie('Element not found');
    Assert.eq('textcontent', text, frog.dom().textContent);
  }));
});
