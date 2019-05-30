import * as Attr from 'ephox/sugar/api/properties/Attr';
import AttributeProperty from 'ephox/sugar/api/properties/AttributeProperty';
import EphoxElement from 'ephox/sugar/test/EphoxElement';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('AttributePropertyTest', function () {
  const attrName = 'custom';
  const attrValue = 'value';
  const init = AttributeProperty(attrName, attrValue);

  const rtlEl = EphoxElement('div');
  Attr.set(rtlEl, 'custom', 'rtl');

  const ltrEl = EphoxElement('div');
  Attr.set(ltrEl, 'custom', 'value');

  const link = EphoxElement('a');
  Attr.set(link, 'href', '#');

  assert.eq(false, init.is(link));
  assert.eq(false, init.is(rtlEl));
  assert.eq(true, init.is(ltrEl));

  init.remove(rtlEl);
  assert.eq(Attr.get(rtlEl, 'custom'), undefined);
  init.set(rtlEl);
  assert.eq(Attr.get(rtlEl, 'custom'), 'value');

  init.set(link);
  assert.eq(Attr.get(link, 'custom'), 'value');
  init.remove(link);
  assert.eq(Attr.get(link, 'custom'), undefined);
});
