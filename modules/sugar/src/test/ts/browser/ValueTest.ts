import { Assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Value from 'ephox/sugar/api/properties/Value';

UnitTest.test('ValueTest', () => {
  const ta = SugarElement.fromHtml<HTMLTextAreaElement>('<textarea>sometexthere</textarea>');
  Assert.eq('', 'sometexthere', Value.get(ta));
  Value.set(ta, 'one');
  Assert.eq('', 'one', ta.dom.value);
  Assert.eq('', 'one', Value.get(ta));

  let success = false;
  try {
    Value.set(ta, undefined as any);
    success = true;
  } catch (e) {
    // expected
  }

  if (success) {
    Assert.fail('setting undefined did not fail');
  }
});
