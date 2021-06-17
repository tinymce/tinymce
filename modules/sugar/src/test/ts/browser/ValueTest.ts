import { assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Value from 'ephox/sugar/api/properties/Value';

UnitTest.test('ValueTest', () => {
  const ta = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea>sometexthere</textarea>');
  assert.eq('sometexthere', Value.get(ta));
  Value.set(ta, 'one');
  assert.eq('one', ta.dom.value);
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
