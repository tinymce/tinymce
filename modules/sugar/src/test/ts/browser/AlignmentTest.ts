import * as Alignment from 'ephox/sugar/api/properties/Alignment';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('AlignmentTest', function () {
  const body = Body.body();
  const createDirectionalP = function (direction) {
    const divEl = EphoxElement('div');
    const par = EphoxElement('p');
    Attr.setAll(divEl, {dir: direction});
    Insert.append(body, divEl);
    Insert.append(divEl, par);
    return par;
  };

  const check = function (element, property, value, expected) {
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
