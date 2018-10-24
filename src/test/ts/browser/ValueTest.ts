import Element from 'ephox/sugar/api/node/Element';
import * as Value from 'ephox/sugar/api/properties/Value';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ValueTest', function() {
  var ta = Element.fromHtml('<textarea>sometexthere</textarea>');
  assert.eq('sometexthere', Value.get(ta));
  Value.set(ta, 'one');
  assert.eq('one', ta.dom().value);
  assert.eq('one', Value.get(ta));

  var success = false;
  try {
    Value.set(ta, undefined);
    success = true;
  } catch (e) {
    // expected
  }

  if (success) assert.fail('setting undefined did not fail');
});

