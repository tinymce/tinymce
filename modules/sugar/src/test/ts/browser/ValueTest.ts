import { assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLTextAreaElement } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';
import * as Value from 'ephox/sugar/api/properties/Value';

UnitTest.test('ValueTest', () => {
  const ta = Element.fromHtml<HTMLTextAreaElement>('<textarea>sometexthere</textarea>');
  assert.eq('sometexthere', Value.get(ta));
  Value.set(ta, 'one');
  assert.eq('one', ta.dom().value);
  assert.eq('one', Value.get(ta));

  let success = false;
  try {
    Value.set(ta, undefined as any);
    success = true;
  } catch (e) {
    // expected
  }

  if (success) {
    assert.fail('setting undefined did not fail');
  }
});
