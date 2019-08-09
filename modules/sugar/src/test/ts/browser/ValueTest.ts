import Element from 'ephox/sugar/api/node/Element';
import * as Value from 'ephox/sugar/api/properties/Value';
import { UnitTest, assert } from '@ephox/bedrock';
import { HTMLTextAreaElement } from '@ephox/dom-globals';

UnitTest.test('ValueTest', function () {
  const ta = Element.fromHtml<HTMLTextAreaElement>('<textarea>sometexthere</textarea>');
  assert.eq('sometexthere', Value.get(ta));
  Value.set(ta, 'one');
  assert.eq('one', ta.dom().value);
  assert.eq('one', Value.get(ta));

  let success = false;
  try {
    Value.set(ta, undefined);
    success = true;
  } catch (e) {
    // expected
  }

  if (success) { assert.fail('setting undefined did not fail'); }
});
