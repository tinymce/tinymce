import { assert, UnitTest } from '@ephox/bedrock-client';
import { Element as DomElement, Text } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Alignment from 'ephox/sugar/api/properties/Alignment';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('AlignmentTest', () => {
  const body = Body.body();
  const createDirectionalP = (direction: 'ltr' | 'rtl') => {
    const divEl = EphoxElement('div');
    const par = EphoxElement('p');
    Attr.setAll(divEl, { dir: direction });
    Insert.append(body, divEl);
    Insert.append(divEl, par);
    return par;
  };

  const check = (element: Element<DomElement> | Element<Text>, property: string, value: string, expected: boolean) => {
    const res = Alignment.hasAlignment(element, property, value);
    assert.eq(expected, res);
    Traverse.parent(element).each(Remove.remove);
  };

  const rtlP = createDirectionalP('rtl');
  check(rtlP, 'text-align', 'left', false);
  const rtlIsRight = createDirectionalP('rtl');
  check(rtlIsRight, 'text-align', 'right', true);

  /* should never be checking alignment on a text node */
  check(Element.fromText('Bacon eatsum'), 'text-align', 'left', false);
});
