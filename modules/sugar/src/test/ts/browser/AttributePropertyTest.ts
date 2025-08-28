import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import { AttributeProperty } from 'ephox/sugar/api/properties/AttributeProperty';
import EphoxElement from 'ephox/sugar/test/EphoxElement';

UnitTest.test('AttributePropertyTest', () => {
  const attrName = 'custom';
  const attrValue = 'value';
  const init = AttributeProperty(attrName, attrValue);

  const rtlEl = EphoxElement('div');
  Attribute.set(rtlEl, 'custom', 'rtl');

  const ltrEl = EphoxElement('div');
  Attribute.set(ltrEl, 'custom', 'value');

  const link = EphoxElement('a');
  Attribute.set(link, 'href', '#');

  Assert.eq('', false, init.is(link));
  Assert.eq('', false, init.is(rtlEl));
  Assert.eq('', true, init.is(ltrEl));

  init.remove(rtlEl);
  Assert.eq('', Attribute.get(rtlEl, 'custom'), undefined);
  init.set(rtlEl);
  Assert.eq('', Attribute.get(rtlEl, 'custom'), 'value');

  init.set(link);
  Assert.eq('', Attribute.get(link, 'custom'), 'value');
  init.remove(link);
  Assert.eq('', Attribute.get(link, 'custom'), undefined);
});
