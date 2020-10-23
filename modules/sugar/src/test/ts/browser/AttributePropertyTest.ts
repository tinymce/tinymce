import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import AttributeProperty from 'ephox/sugar/api/properties/AttributeProperty';
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

  assert.eq(false, init.is(link));
  assert.eq(false, init.is(rtlEl));
  assert.eq(true, init.is(ltrEl));

  init.remove(rtlEl);
  assert.eq(Attribute.get(rtlEl, 'custom'), undefined);
  init.set(rtlEl);
  assert.eq(Attribute.get(rtlEl, 'custom'), 'value');

  init.set(link);
  assert.eq(Attribute.get(link, 'custom'), 'value');
  init.remove(link);
  assert.eq(Attribute.get(link, 'custom'), undefined);
});
